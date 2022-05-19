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
    <Box className='circleContainer'>
      <CircularProgress variant='determinate' value={100} className={`${size} circleTrack`} />
      <Box className='labelContainer'>
        {value && <p className={`progressCircle_label__${size}`}>{`${Math.round(value)}%`}</p>}
      </Box>
      <CircularProgress
        value={value}
        variant={determinate ? 'determinate' : 'indeterminate'}
        className={`${size} circleFill`}
      />
    </Box>
  );
}
