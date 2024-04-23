import React from 'react';

import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontWeight: 600,
    fontSize: 24,
  },
}));

interface TitleProps {
  page: string;
  parentPage: string;
}
export default function Title({ page }: TitleProps): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.titleContainer}>
      <Typography className={classes.title} variant='h1'>
        {page}
      </Typography>
    </div>
  );
}
