import { Box, Divider, Link, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Link as RouterLink, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import strings from 'src/strings';
import useStateLocation from 'src/utils/useStateLocation';

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
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
    disabled: {
      color: theme.palette.neutral[400],
      pointerEvents: 'none',
    },
  })
);

interface Props {
  state: string;
}

export default function DetailsMenu({ state }: Props): JSX.Element | null {
  const classes = useStyles();
  const { accessionId } = useParams<{ accessionId: string }>();

  const paths = [
    {
      title: strings.SEED_COLLECTION,
      route: 'seed-collection',
      active: useRouteMatch('/accessions/:accessionId/seed-collection'),
      disabled: false,
    },
    {
      title: strings.PROCESSING_AND_DRYING,
      route: 'processing-drying',
      active: useRouteMatch('/accessions/:accessionId/processing-drying'),
      disabled: state === 'Nursery',
    },
    {
      title: strings.STORAGE,
      route: 'storage',
      active: useRouteMatch('/accessions/:accessionId/storage'),
      disabled: state === 'Nursery' || state === 'Pending',
    },
    {
      title: strings.WITHDRAWAL,
      route: 'withdrawal',
      active: useRouteMatch('/accessions/:accessionId/withdrawal'),
      disabled: state === 'Nursery' || state === 'Pending',
    },
  ];
  const location = useStateLocation();
  const history = useHistory();

  if (history.location.pathname.endsWith(accessionId)) {
    return null;
  }

  return (
    <Paper className={classes.paper}>
      <Typography variant='h6' className={classes.panelTitle}>
        Details
      </Typography>
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
            id={`menu-${route}`}
            component={RouterLink}
            key={title}
            to={{
              pathname: `/accessions/${accessionId}/${route}`,
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
    </Paper>
  );
}
