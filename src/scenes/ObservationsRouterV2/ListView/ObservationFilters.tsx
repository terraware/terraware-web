import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem } from '@terraware/web-components';

import SegmentControl from 'src/components/common/SegmentControl';
import { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization } from 'src/providers';

import { useObservationFilters } from '../ObservationFiltersProvider';
import ObservationFilterPanel from './ObservationFilterPanel';

export type ObservationFiltersProps = {
  onPlantingSiteChange: (plantingSiteId: PlantingSiteId) => void;
  plantingSiteId: PlantingSiteId;
  plantingSiteOptions: DropdownItem[];
};

const ObservationFilters = ({
  onPlantingSiteChange,
  plantingSiteId,
  plantingSiteOptions,
}: ObservationFiltersProps): JSX.Element => {
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
        <Dropdown
          fullWidth
          id='planting-site-selector'
          onChange={(value: string) =>
            onPlantingSiteChange(value === ALL_PLANTING_SITES ? ALL_PLANTING_SITES : Number(value))
          }
          options={plantingSiteOptions}
          required
          selectedValue={plantingSiteId}
          sx={{ flex: '0 1 320px', maxWidth: '320px' }}
        />
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
      {filtersExpanded && <ObservationFilterPanel plantingSiteId={plantingSiteId} />}
    </Box>
  );
};

export default ObservationFilters;
