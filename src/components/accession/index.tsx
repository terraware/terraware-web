import { Container, Grid } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import {
  Route,
  Switch,
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { putAccession } from '../../api/accession';
import { Accession } from '../../api/types/accessions';
import getAccessionSelector, {
  getAccessionRequestIdAtom,
} from '../../state/selectors/getAccession';
import useRecoilCurl from '../../utils/useRecoilCurl';
import ErrorBoundary from '../ErrorBoundary';
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

  return (
    <main>
      {requestId && (
        <ErrorBoundary>
          <React.Suspense fallback={<div>Loading</div>}>
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
  const history = useHistory();
  const location = useLocation();

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
    const path = location.pathname;
    await putAccession(record);
    history.push('/');
    history.push(path);
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
