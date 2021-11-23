import { Container, Grid } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useEffect, useState } from 'react';
import { Route, Switch, useHistory, useParams } from 'react-router-dom';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { checkIn, putAccession } from 'src/api/seeds/accession';
import { getAccession } from 'src/api/seeds/accession';
import { Accession, AccessionState } from 'src/api/types/accessions';
import ErrorBoundary from 'src/ErrorBoundary';
import snackbarAtom from 'src/state/atoms/snackbar';
import searchSelector from 'src/state/selectors/seeds/search';
import strings from 'src/strings';
import { pendingAccessionsSelector } from '../../../state/selectors/seeds/pendingCheckIn';
import Lab from '../lab';
import { AccessionForm } from '../newAccession';
import Nursery from '../nursery';
import ProcessingAndDrying from '../processingAndDrying';
import Storage from '../storage';
import Withdrawal from '../withdrawal';
import DetailsMenu from './DetailsMenu';
import GerminationMenu from './GerminationMenu';
import AccessionPageHeader from './PageHeader';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
  })
);

export default function AccessionPage(): JSX.Element {
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const history = useHistory();
  const errorHandler = () => {
    setSnackbar({
      type: 'delete',
      msg: strings.GET_ACCESSION_ERROR,
    });
    history.push('/accessions');
  };

  return (
    <ErrorBoundary handler={errorHandler}>
      <React.Suspense fallback={<div />}>
        <Content />
      </React.Suspense>
    </ErrorBoundary>
  );
}

function Content(): JSX.Element {
  const classes = useStyles();
  const { accessionId } = useParams<{ accessionId: string }>();
  const [accession, setAccession] = useState<Accession>();
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const resetSearch = useResetRecoilState(searchSelector);
  const resetPendingCheckInAccessions = useResetRecoilState(pendingAccessionsSelector);
  const history = useHistory();

  const reloadAccession = useCallback(() => {
    const populateAccession = async () => {
      const response = await getAccession(parseInt(accessionId, 10));
      setAccession(response);
    };

    if (accessionId) {
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
          pathname: `/accessions/${accession.id}/${pathDestinationForState(state)}`,
          state: history.location.state,
        };
        history.replace(newLocation);
      }
    }
  }, [accession, history, history.location]);

  const onSubmit = async (record: Accession) => {
    try {
      await putAccession(record.id, record);
      resetSearch();
      reloadAccession();
    } catch (ex) {
      setSnackbar({
        type: 'delete',
        msg: strings.SAVE_ACCESSION_ERROR,
      });
    }
  };

  const onCheckIn = async (id: number) => {
    try {
      await checkIn(id);
      resetSearch();
      reloadAccession();
      resetPendingCheckInAccessions();
    } catch (ex) {
      setSnackbar({
        type: 'delete',
        msg: strings.SAVE_ACCESSION_ERROR,
      });
    }
  };

  if (accession === undefined) {
    setSnackbar({
      type: 'delete',
      msg: strings.GET_ACCESSION_ERROR,
    });
    history.push('/accessions');
    return <></>;
  }

  return (
    <main>
      <AccessionPageHeader accession={accession} />
      <Container maxWidth='lg' className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <DetailsMenu state={accession.state} />
            <GerminationMenu accession={accession} />
          </Grid>
          <Grid item xs={9}>
            <Switch>
              <Route exact path='/accessions/:accessionId/seed-collection'>
                <AccessionForm
                  updating={true}
                  photoFilenames={accession.photoFilenames}
                  accession={accession}
                  onSubmit={onSubmit}
                  onCheckIn={onCheckIn}
                />
              </Route>
              <Route exact path='/accessions/:accessionId/processing-drying'>
                <ProcessingAndDrying accession={accession} onSubmit={onSubmit} />
              </Route>
              <Route exact path='/accessions/:accessionId/storage'>
                <Storage accession={accession} onSubmit={onSubmit} />
              </Route>
              <Route exact path='/accessions/:accessionId/nursery'>
                <Nursery accession={accession} onSubmit={onSubmit} />
              </Route>
              <Route exact path='/accessions/:accessionId/lab'>
                <Lab accession={accession} onSubmit={onSubmit} />
              </Route>
              <Route exact path='/accessions/:accessionId/withdrawal'>
                <Withdrawal accession={accession} onSubmit={onSubmit} />
              </Route>
            </Switch>
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}

// @ts-ignore
function pathDestinationForState(state: AccessionState): string {
  switch (state) {
    case 'Pending':
    case 'Awaiting Check-In':
      return 'seed-collection';
    case 'Processing':
    case 'Processed':
    case 'Drying':
      return 'processing-drying';
    case 'Dried':
      return 'storage';
    case 'In Storage':
    case 'Withdrawn':
      return 'withdrawal';
    case 'Nursery':
      return 'nursery';
  }
}
