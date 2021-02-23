import { Container, Grid } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Route, Switch, useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { putAccession } from '../../api/accession';
import { Accession } from '../../api/types/accessions';
import snackbarAtom from '../../state/atoms/snackbar';
import getAccessionSelector, {
  getAccessionRequestIdAtom,
} from '../../state/selectors/getAccession';
import useRecoilCurl from '../../utils/useRecoilCurl';
import ErrorBoundary from '../ErrorBoundary';
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
  const requestId = useRecoilCurl(getAccessionRequestIdAtom);

  const setSnackbar = useSetRecoilState(snackbarAtom);
  const errorHandler = () => {
    setSnackbar({
      type: 'error',
      msg: 'An error occurred when getting the accession.',
    });
  };

  return (
    <main>
      {requestId && (
        <ErrorBoundary handler={errorHandler}>
          <React.Suspense fallback={<div></div>}>
            <Content requestId={requestId} />
          </React.Suspense>
        </ErrorBoundary>
      )}
    </main>
  );
}

function Content({ requestId }: { requestId: number }): JSX.Element {
  const classes = useStyles();
  const { accessionNumber } = useParams<{ accessionNumber: string }>();
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const setRequestId = useSetRecoilState(getAccessionRequestIdAtom);

  const accession = useRecoilValue(
    getAccessionSelector({ accessionNumber, requestId })
  );

  const clonedAccession = {
    ...accession,
    secondaryCollectors: accession.secondaryCollectors && [
      ...accession.secondaryCollectors,
    ],
  };

  const onSubmit = async (record: Accession) => {
    try {
      await putAccession(record);
      setSnackbar({ type: 'success', msg: 'Accession saved' });
      setRequestId(requestId + 1);
    } catch (ex) {
      setSnackbar({
        type: 'error',
        msg: 'An error occurred when saving the accession.',
      });
    }
  };

  return (
    <main>
      <AccessionPageHeader accession={clonedAccession} />
      <Container maxWidth='lg' className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <DetailsMenu />
            <GerminationMenu accession={clonedAccession} />
          </Grid>
          <Grid item xs={9}>
            <Switch>
              <Route exact path='/accessions/:accessionNumber/seed-collection'>
                <AccessionForm
                  updating={true}
                  photoFilenames={clonedAccession.photoFilenames}
                  accession={clonedAccession}
                  onSubmit={onSubmit}
                />
              </Route>
              <Route
                exact
                path='/accessions/:accessionNumber/processing-drying'
              >
                <ProcessingAndDrying
                  accession={clonedAccession}
                  onSubmit={onSubmit}
                />
              </Route>
              <Route exact path='/accessions/:accessionNumber/storage'>
                <Storage
                  accession={clonedAccession}
                  onSubmit={onSubmit}
                  requestId={requestId}
                />
              </Route>
              <Route exact path='/accessions/:accessionNumber/nursery'>
                <Nursery
                  accession={clonedAccession}
                  onSubmit={onSubmit}
                  requestId={requestId}
                />
              </Route>
              <Route exact path='/accessions/:accessionNumber/lab'>
                <Lab
                  accession={clonedAccession}
                  onSubmit={onSubmit}
                  requestId={requestId}
                />
              </Route>
              <Route exact path='/accessions/:accessionNumber/withdrawal'>
                <Withdrawal accession={clonedAccession} onSubmit={onSubmit} />
              </Route>
            </Switch>
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
