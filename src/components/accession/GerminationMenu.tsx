import { Link, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Link as RouterLink, useParams, useRouteMatch } from 'react-router-dom';
import { Accession } from '../../api/types/accessions';
import Divisor from '../common/Divisor';

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      marginTop: theme.spacing(4),
      padding: theme.spacing(2),
    },
    bold: {
      fontWeight: theme.typography.fontWeightBold,
      color: theme.palette.common.black,
    },
    link: {
      color: theme.palette.common.black,
    },
  })
);

interface Props {
  accession: Accession;
}

export default function GerminationMenu({
  accession,
}: Props): JSX.Element | null {
  const classes = useStyles();
  const { accessionNumber } = useParams<{ accessionNumber: string }>();

  const hasNurseryGerminationTest = accession.germinationTestTypes?.includes(
    'Nursery'
  );

  const typographyClass = useRouteMatch('/accessions/:accessionNumber/nursery')
    ? classes.bold
    : classes.link;

  if (!accession.germinationTestTypes) {
    return null;
  }

  return (
    <Paper className={classes.paper}>
      <Typography variant='h6' className={classes.bold}>
        Germination testing
      </Typography>
      <Divisor mt={1} />
      {hasNurseryGerminationTest && (
        <Link
          id='nursery'
          component={RouterLink}
          to={`/accessions/${accessionNumber}/nursery`}
        >
          <Typography component='p' variant='body1' className={typographyClass}>
            Nursery
          </Typography>
        </Link>
      )}
    </Paper>
  );
}
