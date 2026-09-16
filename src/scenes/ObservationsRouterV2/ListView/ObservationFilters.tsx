import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import SegmentControl from 'src/components/common/SegmentControl';
import { useLocalization } from 'src/providers';

import { useObservationFilters } from '../ObservationFiltersProvider';
import ObservationFilterPanel from './ObservationFilterPanel';

const ObservationFilters = (): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { filtersExpanded, observationType, plotType, setFiltersExpanded, setObservationType, setPlotType } =
    useObservationFilters();

  const plotTypeSegments = useMemo(
    () => [
      { id: 'assigned' as const, label: strings.ASSIGNED_PLOTS },
      { id: 'adHoc' as const, label: strings.AD_HOC_PLOTS },
    ],
    [strings.AD_HOC_PLOTS, strings.ASSIGNED_PLOTS]
  );

  const observationTypeSegments = useMemo(
    () => [
      { id: 'Monitoring' as const, label: strings.PLANT_MONITORING },
      { id: 'Biomass Measurements' as const, label: strings.BIOMASS_MONITORING },
    ],
    [strings.BIOMASS_MONITORING, strings.PLANT_MONITORING]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(2) }}>
      <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: theme.spacing(2) }}>
        <SegmentControl minSegmentWidth={130} onChange={setPlotType} segments={plotTypeSegments} selected={plotType} />
        {plotType === 'adHoc' && (
          <SegmentControl
            minSegmentWidth={130}
            onChange={setObservationType}
            segments={observationTypeSegments}
            selected={observationType}
          />
        )}
        <Button
          icon='filter'
          id='toggle-observation-filters'
          label={filtersExpanded ? strings.HIDE_FILTERS : strings.SHOW_FILTERS}
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          priority='secondary'
          size='medium'
          type='passive'
        />
      </Box>
      {filtersExpanded && <ObservationFilterPanel />}
    </Box>
  );
};

export default ObservationFilters;
