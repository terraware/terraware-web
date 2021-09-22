import { Link, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import {
  Link as RouterLink,
  useHistory,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { Accession } from '../../../api/types/accessions';
import strings from '../../../strings';
import useStateLocation from '../../../utils/useStateLocation';
import Divisor from '../../common/Divisor';

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

  const hasNurseryGerminationTest =
    accession.germinationTestTypes?.includes('Nursery');

  const hasLabGerminationTest = accession.germinationTestTypes?.includes('Lab');

  const TypographyClass = (route: string) =>
    useRouteMatch(route) ? classes.bold : classes.link;
  const location = useStateLocation();
  const history = useHistory();

  if (!accession.germinationTestTypes) {
    return null;
  }

  if (history.location.pathname.endsWith(accessionNumber)) {
    return null;
  }

  return (
    <Paper className={classes.paper}>
      <Typography variant='h6' className={classes.bold}>
        {strings.GERMINATION_TESTING}
      </Typography>
      <Divisor mt={1} />
      {hasNurseryGerminationTest && (
        <Link
          id='nursery'
          component={RouterLink}
          to={{
            pathname: `/accessions/${accessionNumber}/nursery`,
            state: {
              from: location.state?.from ?? '',
            },
          }}
        >
          <Typography
            component='p'
            variant='body1'
            className={TypographyClass('/accessions/:accessionNumber/nursery')}
          >
            {strings.NURSERY}
          </Typography>
        </Link>
      )}
      {hasLabGerminationTest && (
        <Link
          id='lab'
          component={RouterLink}
          to={{
            pathname: `/accessions/${accessionNumber}/lab`,
            state: { from: location.state?.from ?? '' },
          }}
        >
          <Typography
            component='p'
            variant='body1'
            className={TypographyClass('/accessions/:accessionNumber/lab')}
          >
            {strings.LAB}
          </Typography>
        </Link>
      )}
    </Paper>
  );
}
