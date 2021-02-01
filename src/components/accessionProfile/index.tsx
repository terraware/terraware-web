import { Container, Grid } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useParams } from 'react-router-dom';
import { emptyAccession } from '../../api/fixture/accession';
import { Accession, NewAccession } from '../../api/types/accessions';
import AccessionPageHeader from '../AccessionPageHeader';
import DetailsMenu from '../DetailsMenu';
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
  const classes = useStyles();
  const { id } = useParams<{ id: string }>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = (record: NewAccession | Accession): void => {
    //
  };

  return (
    <main>
      <AccessionPageHeader
        accession={{
          ...emptyAccession,
          accessionNumber: id,
          state: 'Pending',
          status: 'Active',
        }}
      />
      <Container maxWidth='lg' className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={3}>
            <DetailsMenu />
          </Grid>
          <Grid item xs={9}>
            <NewAccessionForm accession={emptyAccession} onSubmit={onSubmit} />
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
