import { Link, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Link as RouterLink, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import { Accession } from 'src/api/types/accessions';
import MainPaper from 'src/components/MainPaper';
import PanelTitle from 'src/components/PanelTitle';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import useStateLocation from 'src/utils/useStateLocation';
import Divisor from '../../common/Divisor';

const useStyles = makeStyles((theme) =>
  createStyles({
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
    <MainPaper>
      <PanelTitle title={strings.GERMINATION_TESTING} />
      <Divisor mt={1} />
      {hasNurseryGerminationTest && (
        <Link
          id='nursery'
          component={RouterLink}
          to={{
            pathname: APP_PATHS.ACCESSIONS_ITEM_NURSERY.replace(':accessionId', accessionId),
            state: {
              from: location.state?.from ?? '',
            },
          }}
        >
          <Typography component='p' variant='body1' className={TypographyClass(APP_PATHS.ACCESSIONS_ITEM_NURSERY)}>
            {strings.NURSERY}
          </Typography>
        </Link>
      )}
      {hasLabGerminationTest && (
        <Link
          id='lab'
          component={RouterLink}
          to={{
            pathname: APP_PATHS.ACCESSIONS_ITEM_LAB.replace(':accessionId', accessionId),
            state: { from: location.state?.from ?? '' },
          }}
        >
          <Typography component='p' variant='body1' className={TypographyClass(APP_PATHS.ACCESSIONS_ITEM_LAB)}>
            {strings.LAB}
          </Typography>
        </Link>
      )}
    </MainPaper>
  );
}
