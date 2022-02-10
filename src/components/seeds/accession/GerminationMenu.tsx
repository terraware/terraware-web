import { Link, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Link as RouterLink, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { Accession } from 'src/api/types/accessions';
import strings from 'src/strings';
import useStateLocation from 'src/utils/useStateLocation';
import Divisor from '../../common/Divisor';

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      marginTop: theme.spacing(4),
      padding: theme.spacing(2),
      border: '1px solid #A9B7B8',
      borderRadius: '8px',
      boxShadow: 'none',
    },
    panelTitle: {
      fontSize: '20px',
      lineHeight: '28px',
      fontWeight: 600,
      color: '#3A4445',
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

export default function GerminationMenu({ accession }: Props): JSX.Element | null {
  const classes = useStyles();
  const { accessionId } = useParams<{ accessionId: string }>();

  const hasNurseryGerminationTest = accession.germinationTestTypes?.includes('Nursery');

  const hasLabGerminationTest = accession.germinationTestTypes?.includes('Lab');

  const TypographyClass = (route: string) => (useRouteMatch(route) ? classes.bold : classes.link);
  const location = useStateLocation();
  const history = useHistory();

  if (!accession.germinationTestTypes) {
    return null;
  }

  if (history.location.pathname.endsWith(accessionId)) {
    return null;
  }

  return (
    <Paper className={classes.paper}>
      <Typography variant='h6' className={classes.panelTitle}>
        {strings.GERMINATION_TESTING}
      </Typography>
      <Divisor mt={1} />
      {hasNurseryGerminationTest && (
        <Link
          id='nursery'
          component={RouterLink}
          to={{
            pathname: `/accessions/${accessionId}/nursery`,
            state: {
              from: location.state?.from ?? '',
            },
          }}
        >
          <Typography component='p' variant='body1' className={TypographyClass('/accessions/:accessionId/nursery')}>
            {strings.NURSERY}
          </Typography>
        </Link>
      )}
      {hasLabGerminationTest && (
        <Link
          id='lab'
          component={RouterLink}
          to={{
            pathname: `/accessions/${accessionId}/lab`,
            state: { from: location.state?.from ?? '' },
          }}
        >
          <Typography component='p' variant='body1' className={TypographyClass('/accessions/:accessionId/lab')}>
            {strings.LAB}
          </Typography>
        </Link>
      )}
    </Paper>
  );
}
