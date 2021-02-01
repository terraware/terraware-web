import { Container, Grid } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { putAccession } from '../../api/accession';
import {
  Accession,
  isAccession,
  NewAccession,
} from '../../api/types/accessions';
import getAccessionRequestIdAtom from '../../state/atoms/getAccessionRequestId';
import getAccessionSelector from '../../state/selectors/getAccession';
import useRecoilCurl from '../../utils/useRecoilCurl';
import AccessionPageHeader from '../AccessionPageHeader';
import DetailsMenu from '../DetailsMenu';
import ErrorBoundary from '../ErrorBoundary';
import { NewAccessionForm } from '../newAccession';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    paper: {
      padding: theme.spacing(2),
    },
    bold: {
      fontWeight: 600,
    },
    link: {
      cursor: 'pointer',
    },
  })
);

export default function AccessionProfile(): JSX.Element {
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

  const accession = useRecoilValue(
    getAccessionSelector({ accessionNumber, requestId })
  );

  const onSubmit = async (record: NewAccession | Accession) => {
    if (isAccession(record)) {
      await putAccession(record);
      history.push('/');
      history.push(`/accessions/${accessionNumber}/seed-collection`);
    }
  };

  return (
    <>
      <AccessionPageHeader accession={{ ...accession }} />
      <Container maxWidth='lg' className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <DetailsMenu />
          </Grid>
          <Grid item xs={9}>
            <NewAccessionForm accession={accession} onSubmit={onSubmit} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
