import { Box, CircularProgress } from '@material-ui/core';
import React from 'react';
import './styles.scss';

export interface Props {
  size?: 'small' | 'medium' | 'large';
  determinate: true | false;
  value?: number;
}

export default function ProgressCircle(props: Props): JSX.Element {
  const { size = 'small', determinate, value } = props;

  return (
    <Box className='circle-container'>
      <CircularProgress variant='determinate' value={100} className={`circle-track circle-track--${size}`} />
      <Box className='label-container'>
        {value && <p className={`progress-circle-label--{size}`}>{`${Math.round(value)}%`}</p>}
      </Box>
      <CircularProgress
        value={value}
        variant={determinate ? 'determinate' : 'indeterminate'}
        className={`circle-fill circle-track--${size}`}
      />
    </Box>
  );
}
