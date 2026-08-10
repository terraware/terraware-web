import React, { type JSX } from 'react';

import { Box, TooltipProps, useTheme } from '@mui/material';

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

  const field = (
    <TextField
      display={true}
      id={id}
      label={label}
      tooltipTitle={tooltipTitle}
      type='text'
      value={value}
      sx={
        source
          ? {
              paddingTop: theme.spacing(3),
              position: 'relative',
              '& .textfield-label': {
                left: 0,
                position: 'absolute',
                top: 0,
                width: 'max-content',
              },
            }
          : undefined
      }
    />
  );

  if (!source) {
    return field;
  }

  return (
    <Box sx={{ alignItems: 'flex-end', display: 'flex', gap: theme.spacing(1) }}>
      {field}
      <Box flexShrink={0} paddingBottom={theme.spacing(0.5)}>
        <SpeciesDataSourceBadge source={source} />
      </Box>
    </Box>
  );
};

export default SpeciesDataSourceField;
