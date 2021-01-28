import { Box, Divider, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';

const useStyles = makeStyles((theme) =>
  createStyles({
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

export default function DetailsMenu(): JSX.Element {
  const classes = useStyles();
  const { id } = useParams<{ id: string }>();

  const paths = [
    {
      title: 'Seed Collection',
      route: 'seed-collection',
      active: useRouteMatch('/accessions/:id/seed-collection'),
    },
    {
      title: 'Processing & Drying',
      route: 'processing-drying',
      active: useRouteMatch('/accessions/:id/processing-drying'),
    },
    {
      title: 'Storage',
      route: 'storage',
      active: useRouteMatch('/accessions/:id/storage'),
    },
    {
      title: 'Withdrawal',
      route: 'withdrawal',
      active: useRouteMatch('/accessions/:id/withdrawal'),
    },
  ];

  const goTo = (route: string) => {
    window.location.href = `/accessions/${id}/${route}`;
  };

  return (
    <Paper className={classes.paper}>
      <Typography variant='h6' className={classes.bold}>
        Details
      </Typography>
      <Box mt={1} />
      <Divider light />
      <Box mt={1} />
      {paths.map(({ title, active, route }) => (
        <Typography
          key={title}
          onClick={() => !active && goTo(route)}
          component='p'
          variant='body1'
          className={active ? classes.bold : classes.link}
        >
          {title}
        </Typography>
      ))}
    </Paper>
  );
}
