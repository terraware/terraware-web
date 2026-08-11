import React, { type JSX } from 'react';

import { Box, TooltipProps, useTheme } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';

import TextField from 'src/components/common/Textfield/Textfield';
import { SpeciesDataSourcePayload } from 'src/queries/generated/species';

import SpeciesDataSourceBadge from './SpeciesDataSourceBadge';

type SpeciesDataSourceFieldProps = {
  id: string;
  label: string;
  source?: SpeciesDataSourcePayload;
  tooltipTitle?: TooltipProps['title'];
  value?: string;
};

const SpeciesDataSourceField = ({
  id,
  label,
  source,
  tooltipTitle,
  value,
}: SpeciesDataSourceFieldProps): JSX.Element => {
  const theme = useTheme();

  if (!source) {
    return <TextField display={true} id={id} label={label} tooltipTitle={tooltipTitle} type='text' value={value} />;
  }

  return (
    <Box className='textfield'>
      <Box component='label' htmlFor={id} className='textfield-label'>
        {label}
        {tooltipTitle && <IconTooltip title={tooltipTitle} />}
      </Box>
      <Box sx={{ alignItems: 'flex-end', display: 'flex', gap: theme.spacing(1), width: '100%' }}>
        <p id={id} className='textfield-value--display' style={{ margin: 0 }}>
          {value}
        </p>
        <Box flexShrink={0} paddingBottom={theme.spacing(0.5)}>
          <SpeciesDataSourceBadge source={source} />
        </Box>
      </Box>
    </Box>
  );
};

export default SpeciesDataSourceField;
