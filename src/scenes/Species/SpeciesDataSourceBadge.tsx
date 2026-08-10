import React, { type JSX } from 'react';

import { Box, Tooltip } from '@mui/material';
import { Badge } from '@terraware/web-components';

import { SpeciesDataSourcePayload } from 'src/queries/generated/species';
import strings from 'src/strings';

type SpeciesDataSourceBadgeProps = {
  source?: SpeciesDataSourcePayload;
};

const SpeciesDataSourceBadge = ({ source }: SpeciesDataSourceBadgeProps): JSX.Element | null => {
  if (!source) {
    return null;
  }

  return (
    <Tooltip title={strings.formatString(strings.SPECIES_PROJECT_DATA_SOURCE_SYNC, source.datasetDate) as string}>
      <Box component='span' sx={{ display: 'inline-flex' }}>
        <Badge label={source.datasetType} />
      </Box>
    </Tooltip>
  );
};

export default SpeciesDataSourceBadge;
