import { makeStyles } from '@mui/styles';
import React from 'react';
import Icon from './icon/Icon';
import { Theme } from '@mui/material';

const useStyles = makeStyles((theme: Theme) => ({
  divisor: {
    background:
      'linear-gradient(90deg, rgba(202, 210, 211, 0) 0%, #CAD2D3 25%, #CAD2D3 49%, rgba(202, 210, 211, 0) 49%, rgba(202, 210, 211, 0) 51%, #CAD2D3 51%, #CAD2D3 75%, rgba(202, 210, 211, 0) 100%);',
    width: '100%',
    height: '1px',
    position: 'relative',
  },
  divisorIcon: {
    position: 'absolute',
    fill: theme.palette.TwClrIcnSuccess,
    right: 'calc(50% - 8px)',
    bottom: '-8px',
  },
}));

export default function TfDivisor(): JSX.Element {
  const classes = useStyles();

  return (
    <div className={classes.divisor}>
      <Icon name='leaf' className={classes.divisorIcon} />
    </div>
  );
}
