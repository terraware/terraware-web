import React, { type JSX } from 'react';

import { Box, Tooltip } from '@mui/material';
import { Badge } from '@terraware/web-components';

import { SpeciesDataSourcePayload } from 'src/queries/generated/species';
import strings from 'src/strings';

const DATA_SOURCE_LABELS: Record<string, string> = {
  GBIF: 'Global Biodiversity Information Facility',
  GRIIS: 'Global Register of Introduced and Invasive Species',
  WCVP: 'World Checklist of Vascular Plants',
  NaturalEarth: 'Natural Earth',
  RESOLVE: 'RESOLVE Ecoregions',
};

const ACRONYM_SOURCES = new Set(['GBIF', 'GRIIS', 'WCVP']);
export const speciesDataSourceLabel = (datasetType?: string): string =>
  datasetType ? DATA_SOURCE_LABELS[datasetType] ?? datasetType : '';
export const speciesDataSourceAcronymLabel = (datasetType?: string): string => {
  if (!datasetType) {
    return '';
  }
  const fullName = DATA_SOURCE_LABELS[datasetType];
  if (!fullName) {
    return datasetType;
  }
  return ACRONYM_SOURCES.has(datasetType) ? `${datasetType} (${fullName})` : fullName;
};

type SpeciesDataSourceBadgeProps = {
  source?: SpeciesDataSourcePayload;
};

const SpeciesDataSourceBadge = ({ source }: SpeciesDataSourceBadgeProps): JSX.Element | null => {
  if (!source) {
    return null;
  }

  return (
    <Tooltip
      title={
        <>
          {speciesDataSourceLabel(source.datasetType)}
          <br />
          {strings.formatString(strings.SPECIES_PROJECT_DATA_SOURCE_SYNC, source.datasetDate)}
        </>
      }
    >
      <Box component='span' sx={{ display: 'inline-flex' }}>
        <Badge label={source.datasetType} />
      </Box>
    </Tooltip>
  );
};

export default SpeciesDataSourceBadge;
