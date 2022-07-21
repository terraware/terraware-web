import { CircularProgress, Container, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { Route, Switch, useHistory, useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { checkIn, getAccession, putAccession } from 'src/api/seeds/accession';
import { Accession, AccessionState } from 'src/api/types/accessions';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import ErrorBoundary from 'src/ErrorBoundary';
import snackbarAtom from 'src/state/snackbar';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import Lab from '../lab';
import { AccessionForm } from '../newAccession';
import Nursery from '../nursery';
import ProcessingAndDrying from '../processingAndDrying';
import Storage from '../storage';
import Withdrawal from '../withdrawal';
import DetailsMenu from './DetailsMenu';
import GerminationMenu from './GerminationMenu';
import AccessionPageHeader from './PageHeader';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    padding: '32px 0',
  },
  verticalSpacing: {
    marginTop: theme.spacing(1),
  },
}));

interface AccessionPageProps {
  organization?: ServerOrganization;
}

export default function AccessionPage({ organization }: AccessionPageProps): JSX.Element {
  // TODO: consider navigating to the main accessions page if we cannot
  // fetch the current accession.
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const errorHandler = () => {
    setSnackbar({
      type: 'toast',
      priority: 'critical',
      msg: strings.GET_ACCESSION_ERROR,
    });
  };

  return (
    <ErrorBoundary handler={errorHandler}>
      <React.Suspense fallback={<div />}>
        <Content organization={organization} />
      </React.Suspense>
    </ErrorBoundary>
  );
}

function Content({ organization }: AccessionPageProps): JSX.Element {
  const classes = useStyles();
  const { accessionId } = useParams<{ accessionId: string }>();
  const [accession, setAccession] = useState<Accession>();
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const history = useHistory();

  const reloadAccession = useCallback(() => {
    const populateAccession = async () => {
      const response = await getAccession(parseInt(accessionId, 10));
      setAccession(response);
    };

    if (accessionId !== undefined) {
      populateAccession();
    } else {
      setAccession(undefined);
    }
  }, [accessionId]);

  useEffect(() => {
    reloadAccession();
  }, [reloadAccession]);

  useEffect(() => {
    if (accession && accession.id) {
      if (history.location.pathname.endsWith(accession.id.toString())) {
        const state = accession.state;
        const newLocation = {
          pathname: pathDestinationForState(state).replace(':accessionId', accession.id.toString()),
          state: history.location.state,
        };
        history.replace(newLocation);
      }
    }
  }, [accession, history, history.location]);

  const onSubmit = async (record: Accession) => {
    try {
      await putAccession(record.id, record);
      reloadAccession();
    } catch (ex) {
      setSnackbar({
        priority: 'critical',
        type: 'toast',
        msg: strings.SAVE_ACCESSION_ERROR,
      });
    }
  };

  const onCheckIn = async (id: number) => {
    try {
      await checkIn(id);
      reloadAccession();
    } catch (ex) {
      setSnackbar({
        type: 'toast',
        priority: 'critical',
        msg: strings.SAVE_ACCESSION_ERROR,
      });
    }
  };

  if (accession === undefined) {
    return <CircularProgress id='spinner-alerts' />;
  }

  return (
    <TfMain>
      <AccessionPageHeader accession={accession} />
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <DetailsMenu state={accession.state} />
            <div className={classes.verticalSpacing} />
            <GerminationMenu accession={accession} />
          </Grid>
          <Grid item xs={9}>
            <Switch>
              <Route exact path={APP_PATHS.ACCESSIONS_ITEM_SEED_COLLECTION}>
                <AccessionForm
                  updating={true}
                  photoFilenames={accession.photoFilenames}
                  accession={accession}
                  organization={organization}
                  onSubmit={onSubmit}
                  onCheckIn={onCheckIn}
                />
              </Route>
              <Route exact path={APP_PATHS.ACCESSIONS_ITEM_PROCESSING_DRYING}>
                <ProcessingAndDrying accession={accession} onSubmit={onSubmit} organization={organization} />
              </Route>
              <Route exact path={APP_PATHS.ACCESSIONS_ITEM_STORAGE}>
                <Storage accession={accession} onSubmit={onSubmit} organization={organization} />
              </Route>
              <Route exact path={APP_PATHS.ACCESSIONS_ITEM_NURSERY}>
                <Nursery accession={accession} onSubmit={onSubmit} organization={organization} />
              </Route>
              <Route exact path={APP_PATHS.ACCESSIONS_ITEM_LAB}>
                <Lab accession={accession} onSubmit={onSubmit} organization={organization} />
              </Route>
              <Route exact path={APP_PATHS.ACCESSIONS_ITEM_WITHDRAWAL}>
                <Withdrawal accession={accession} onSubmit={onSubmit} organization={organization} />
              </Route>
            </Switch>
          </Grid>
        </Grid>
      </Container>
    </TfMain>
  );
}

// @ts-ignore
function pathDestinationForState(state: AccessionState): string {
  switch (state) {
    case 'Pending':
    case 'Awaiting Check-In':
      return APP_PATHS.ACCESSIONS_ITEM_SEED_COLLECTION;
    case 'Processing':
    case 'Processed':
    case 'Drying':
      return APP_PATHS.ACCESSIONS_ITEM_PROCESSING_DRYING;
    case 'Dried':
      return APP_PATHS.ACCESSIONS_ITEM_STORAGE;
    case 'In Storage':
    case 'Withdrawn':
      return APP_PATHS.ACCESSIONS_ITEM_WITHDRAWAL;
    case 'Nursery':
      return APP_PATHS.ACCESSIONS_ITEM_NURSERY;
  }
}
