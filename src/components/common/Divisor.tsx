import { Box, Divider } from '@mui/material';
import React from 'react';

export interface Props {
  mt?: number;
}
export default function Divisor({ mt = 3 }: Props): JSX.Element {
  return (
    <>
      <Box mt={mt} />
      <Divider light />
      <Box mt={mt} />
    </>
  );
}
