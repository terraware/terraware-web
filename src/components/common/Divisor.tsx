import { Box, Divider } from '@material-ui/core';
import React from 'react';

interface Props {
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
