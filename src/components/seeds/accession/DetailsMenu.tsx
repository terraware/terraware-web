import { Box, Divider, Link, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { Link as RouterLink, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import MainPaper from 'src/components/MainPaper';
import PanelTitle from 'src/components/PanelTitle';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import useStateLocation from 'src/utils/useStateLocation';

const useStyles = makeStyles((theme: Theme) => ({
  bold: {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.common.black,
  },
  link: {
    color: theme.palette.common.black,
  },
  disabled: {
    color: theme.palette.neutral[400],
    pointerEvents: 'none',
  },
}));

interface Props {
  state: string;
}

function getAccessionPathSuffix(path: APP_PATHS) {
  return path.replace(APP_PATHS.ACCESSIONS_ITEM + '/', '');
}

export default function DetailsMenu({ state }: Props): JSX.Element | null {
  const classes = useStyles();
  const { accessionId } = useParams<{ accessionId: string }>();

  const paths = [
    {
      title: strings.SEED_COLLECTION,
      route: APP_PATHS.ACCESSIONS_ITEM_SEED_COLLECTION,
      active: useRouteMatch(APP_PATHS.ACCESSIONS_ITEM_SEED_COLLECTION),
      disabled: false,
    },
    {
      title: strings.PROCESSING_AND_DRYING,
      route: APP_PATHS.ACCESSIONS_ITEM_PROCESSING_DRYING,
      active: useRouteMatch(APP_PATHS.ACCESSIONS_ITEM_PROCESSING_DRYING),
      disabled: state === 'Nursery' || state === 'Awaiting Check-In',
    },
    {
      title: strings.STORAGE,
      route: APP_PATHS.ACCESSIONS_ITEM_STORAGE,
      active: useRouteMatch(APP_PATHS.ACCESSIONS_ITEM_STORAGE),
      disabled: state === 'Nursery' || state === 'Pending' || state === 'Awaiting Check-In',
    },
    {
      title: strings.WITHDRAWAL,
      route: APP_PATHS.ACCESSIONS_ITEM_WITHDRAWAL,
      active: useRouteMatch(APP_PATHS.ACCESSIONS_ITEM_WITHDRAWAL),
      disabled: state === 'Nursery' || state === 'Pending' || state === 'Awaiting Check-In',
    },
  ];
  const location = useStateLocation();
  const history = useHistory();

  if (history.location.pathname.endsWith(accessionId)) {
    return null;
  }

  return (
    <MainPaper>
      <PanelTitle title={strings.DETAILS} />
      <Box mt={1} />
      <Divider light />
      <Box mt={1} />
      {paths.map(({ title, active, route, disabled }) =>
        disabled ? (
          <span key={title}>
            <Typography component='p' variant='body1' className={classes.disabled}>
              {title}
            </Typography>
          </span>
        ) : (
          <Link
            id={`menu-${getAccessionPathSuffix(route)}`}
            component={RouterLink}
            key={title}
            to={{
              pathname: route.replace(':accessionId', accessionId),
              state: {
                from: location.state?.from ?? '',
              },
            }}
          >
            <Typography component='p' variant='body1' className={active ? classes.bold : classes.link}>
              {title}
            </Typography>
          </Link>
        )
      )}
    </MainPaper>
  );
}
