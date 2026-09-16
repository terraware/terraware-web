import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import SegmentControl from 'src/components/common/SegmentControl';
import { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import { useLocalization } from 'src/providers';

import { ObservationTypeFilter, PlotType } from '../useObservationFilters';

export type ObservationFiltersProps = {
  observationType: ObservationTypeFilter;
  onObservationTypeChange: (observationType: ObservationTypeFilter) => void;
  onPlantingSiteChange: (plantingSiteId: PlantingSiteId) => void;
  onPlotTypeChange: (plotType: PlotType) => void;
  plantingSiteId: PlantingSiteId;
  plantingSiteOptions: DropdownItem[];
  plotType: PlotType;
};

const ObservationFilters = ({
  observationType,
  onObservationTypeChange,
  onPlantingSiteChange,
  onPlotTypeChange,
  plantingSiteId,
  plantingSiteOptions,
  plotType,
}: ObservationFiltersProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

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
      <SegmentControl
        minSegmentWidth={130}
        onChange={onPlotTypeChange}
        segments={plotTypeSegments}
        selected={plotType}
      />
      {plotType === 'adHoc' && (
        <SegmentControl
          minSegmentWidth={130}
          onChange={onObservationTypeChange}
          segments={observationTypeSegments}
          selected={observationType}
        />
      )}
    </Box>
  );
};

export default ObservationFilters;
