import { Box, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  note: {
    borderRadius: 8,
    backgroundColor: theme.palette.neutral[200],
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
  },
}));

export interface Props {
  children: string;
}

export default function Note({ children }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Box className={classes.note}>
      <Typography component='p'>{children}</Typography>
    </Box>
  );
}
