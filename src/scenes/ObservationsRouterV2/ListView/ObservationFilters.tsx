import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import SegmentControl from 'src/components/common/SegmentControl';
import { type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization } from 'src/providers';

import { useObservationFilters } from '../ObservationFiltersProvider';
import ObservationFilterPanel from './ObservationFilterPanel';

export type ObservationFiltersProps = {
  plantingSiteId: PlantingSiteId;
};

const ObservationFilters = ({ plantingSiteId }: ObservationFiltersProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { filtersExpanded, plotType, setFiltersExpanded, setPlotType } = useObservationFilters();

  const plotTypeSegments = useMemo(
    () => [
      { id: 'assigned' as const, label: strings.ASSIGNED_PLOTS },
      { id: 'adHoc' as const, label: strings.AD_HOC_PLOTS },
    ],
    [strings.AD_HOC_PLOTS, strings.ASSIGNED_PLOTS]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(2) }}>
      <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: theme.spacing(2) }}>
        <SegmentControl minSegmentWidth={130} onChange={setPlotType} segments={plotTypeSegments} selected={plotType} />
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
      {filtersExpanded && <ObservationFilterPanel plantingSiteId={plantingSiteId} />}
    </Box>
  );
};

export default ObservationFilters;
