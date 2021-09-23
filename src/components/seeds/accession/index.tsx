import { Container, Grid } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Route, Switch, useHistory, useParams } from 'react-router-dom';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { putAccession } from '../../../api/seeds/accession';
import { Accession, AccessionState } from '../../../api/types/accessions';
import ErrorBoundary from '../../../ErrorBoundary';
import snackbarAtom from '../../../state/atoms/snackbar';
import getAccessionSelector from '../../../state/selectors/accession';
import searchSelector from '../../../state/selectors/search';
import strings from '../../../strings';
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
  const errorHandler = () => {
    setSnackbar({
      type: 'delete',
      msg: strings.GET_ACCESSION_ERROR,
    });
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
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const resetSearch = useResetRecoilState(searchSelector);
  const history = useHistory();

  const accession = useRecoilValue(getAccessionSelector(parseInt(accessionId, 10)));
  const resetAccession = useResetRecoilState(
    getAccessionSelector(parseInt(accessionId, 10))
  );

  React.useEffect(() => {
    if (accession && accession.id) {
      if (history.location.pathname.endsWith(accession.id.toString())) {
        const state = accession.state;
        const newLocation = {
          pathname: `/accessions/${
            accession.id
          }/${pathDestinationForState(state)}`,
          state: history.location.state,
        };
        history.replace(newLocation);
      }
    }
  }, [accession, history, history.location]);

  React.useEffect(() => {
    return () => {
      resetAccession();
    };
  }, [resetAccession]);

  const clonedAccession = {
    ...accession,
    secondaryCollectors: accession.secondaryCollectors && [
      ...accession.secondaryCollectors,
    ],
  };

  const onSubmit = async (record: Accession) => {
    try {
      await putAccession(record);
      resetSearch();
      resetAccession();
    } catch (ex) {
      setSnackbar({
        type: 'delete',
        msg: strings.SAVE_ACCESSION_ERROR,
      });
    }
  };

  return (
    <main>
      <AccessionPageHeader accession={clonedAccession} />
      <Container maxWidth='lg' className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <DetailsMenu state={clonedAccession.state} />
            <GerminationMenu accession={clonedAccession} />
          </Grid>
          <Grid item xs={9}>
            <Switch>
              <Route exact path='/accessions/:accessionId/seed-collection'>
                <AccessionForm
                  updating={true}
                  photoFilenames={clonedAccession.photoFilenames}
                  accession={clonedAccession}
                  onSubmit={onSubmit}
                />
              </Route>
              <Route
                exact
                path='/accessions/:accessionId/processing-drying'
              >
                <ProcessingAndDrying
                  accession={clonedAccession}
                  onSubmit={onSubmit}
                />
              </Route>
              <Route exact path='/accessions/:accessionId/storage'>
                <Storage accession={clonedAccession} onSubmit={onSubmit} />
              </Route>
              <Route exact path='/accessions/:accessionId/nursery'>
                <Nursery accession={clonedAccession} onSubmit={onSubmit} />
              </Route>
              <Route exact path='/accessions/:accessionId/lab'>
                <Lab accession={clonedAccession} onSubmit={onSubmit} />
              </Route>
              <Route exact path='/accessions/:accessionId/withdrawal'>
                <Withdrawal accession={clonedAccession} onSubmit={onSubmit} />
              </Route>
            </Switch>
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}

function pathDestinationForState(state: AccessionState): string {
  switch (state) {
    case 'Pending':
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
