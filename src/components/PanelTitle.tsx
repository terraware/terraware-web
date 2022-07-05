import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles(() => ({
  panelTitle: {
    fontSize: '20px',
    lineHeight: '28px',
    fontWeight: 600,
    color: '#3A4445',
  },
}));

interface Props {
  title: string;
  id?: string;
  gutterBottom?: boolean;
}

export default function PanelTitle({ title, id, gutterBottom }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Typography variant='h6' className={classes.panelTitle} id={id} gutterBottom={gutterBottom}>
      {title}
    </Typography>
  );
}
