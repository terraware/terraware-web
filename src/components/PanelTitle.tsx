import { Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { ElementType } from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    panelTitle: {
      fontSize: '20px',
      lineHeight: '28px',
      fontWeight: 600,
      color: '#3A4445',
    },
  })
);

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
