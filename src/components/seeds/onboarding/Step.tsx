import { createStyles, makeStyles, Typography } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    flex: {
      display: 'flex',
      justifyContent: 'space-between',
    },
  })
);

interface Props {
  title: string;
  description: string;
  stepNumber: number;
}

export default function Step({
  title,
  description,
  stepNumber,
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <div>
      <div className={classes.flex}>
        <Typography variant='h6'>{title}</Typography>
        <Typography variant='subtitle1'>{stepNumber}/5</Typography>
      </div>
      <Typography variant='body2'>{description}</Typography>
    </div>
  );
}
