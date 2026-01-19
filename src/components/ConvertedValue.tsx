import React, { type JSX } from 'react';

import { Box, Typography } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';

import strings from 'src/strings';
import { convertValue } from 'src/units';

type ConvertedValueProps = {
  quantity: number;
  unit: string;
  isEstimated?: boolean;
  showTooltip?: boolean;
};

export default function ConvertedValue(props: ConvertedValueProps): JSX.Element {
  const { quantity, unit, isEstimated, showTooltip } = props;
  return (
    <Box display='flex'>
      <Typography fontWeight={500}>
        ({isEstimated && '~'}
        {convertValue(quantity, unit)})
      </Typography>
      {showTooltip && <IconTooltip title={strings.CONVERTED_VALUE_INFO} />}
    </Box>
  );
}
