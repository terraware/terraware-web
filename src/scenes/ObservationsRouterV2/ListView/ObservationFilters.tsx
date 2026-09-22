import React, { type JSX, useMemo } from 'react';

import { Badge, Box, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import SegmentControl from 'src/components/common/SegmentControl';
import { type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization } from 'src/providers';

import { useObservationFilters } from '../ObservationFiltersProvider';
import useFilteredObservationResults from '../useFilteredObservationResults';
import ObservationFilterPanel from './ObservationFilterPanel';
import ObservationTimeline from './ObservationTimeline';
import ViewModeToggle from './ViewModeToggle';

export type ObservationFiltersProps = {
  plantingSiteId: PlantingSiteId;
  plantingSiteSelector: React.ReactNode;
};

const ObservationFilters = ({ plantingSiteId, plantingSiteSelector }: ObservationFiltersProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { activeFilterCount, filtersExpanded, observationType, plotType, setFiltersExpanded, setPlotType } =
    useObservationFilters();

  const { emptyState } = useFilteredObservationResults({ observationType, plantingSiteId, plotType });
  const panelOpen = filtersExpanded && emptyState !== 'noObservations';

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
        {plantingSiteSelector}
        <SegmentControl minSegmentWidth={130} onChange={setPlotType} segments={plotTypeSegments} selected={plotType} />
        <Badge
          badgeContent={activeFilterCount}
          id='active-filter-count'
          sx={{
            '& .MuiBadge-badge': {
              background: theme.palette.TwClrBgBrand,
              color: theme.palette.TwClrTxtInverse,
              fontWeight: 600,
            },
          }}
        >
          <Button
            disabled={emptyState === 'noObservations'}
            icon='filter'
            id='toggle-observation-filters'
            label={panelOpen ? strings.HIDE_FILTERS : strings.SHOW_FILTERS}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            priority='secondary'
            size='medium'
            type='passive'
          />
        </Badge>
        <Box sx={{ marginLeft: 'auto' }}>
          <ViewModeToggle />
        </Box>
      </Box>
      {panelOpen && <ObservationFilterPanel plantingSiteId={plantingSiteId} />}
      {plantingSiteId !== 'all' && <ObservationTimeline plantingSiteId={plantingSiteId} />}
    </Box>
  );
};

export default ObservationFilters;
