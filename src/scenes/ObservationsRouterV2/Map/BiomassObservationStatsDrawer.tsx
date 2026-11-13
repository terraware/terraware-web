import React, { type JSX, useMemo } from 'react';

import { Box, CircularProgress } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import Button from 'src/components/common/button/Button';
import { useGetOneObservationResults } from 'src/hooks/observations';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization } from 'src/providers';
import { getShortDate } from 'src/utils/dateFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

type BiomassObservationStatsProperties = {
  monitoringPlotName: string;
  numTrees: number;
  numShrubs: number;
  numSpecies: number;
  observationDate: string;
};

type BiomassObservationStatsDrawerProps = {
  observationId: number;
  onViewOnMap?: () => void;
  plantingSiteId: number;
};

const BiomassObservationStatsDrawer = ({
  observationId,
  onViewOnMap,
  plantingSiteId,
}: BiomassObservationStatsDrawerProps): JSX.Element | undefined => {
  const { activeLocale, strings } = useLocalization();
  const defaultTimezone = useDefaultTimeZone().get().id;

  const { data: observationResultsResponse, isLoading: observationResultsLoading } = useGetOneObservationResults({
    observationId,
  });
  const { plantingSite, isLoading: plantingSiteLoading } = usePlantingSite(plantingSiteId);

  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);

  const isLoading = useMemo(
    () => observationResultsLoading && plantingSiteLoading,
    [observationResultsLoading, plantingSiteLoading]
  );

  const monitoringPlot = results?.adHocPlot;

  const properties = useMemo((): BiomassObservationStatsProperties | undefined => {
    const measurements = monitoringPlot?.biomassMeasurements;
    if (results && monitoringPlot && measurements) {
      const completedTime = monitoringPlot.completedTime ?? results.completedTime;
      const completedDate = completedTime
        ? getDateDisplayValue(completedTime, plantingSite?.timeZone ?? defaultTimezone)
        : undefined;
      return {
        monitoringPlotName: monitoringPlot.monitoringPlotName,
        numTrees: measurements.trees.filter((tree) => tree.treeGrowthForm !== 'Shrub').length,
        numShrubs: measurements.trees.filter((tree) => tree.treeGrowthForm === 'Shrub').length,
        numSpecies: measurements.treeSpeciesCount,
        observationDate: completedDate ? getShortDate(completedDate, activeLocale) : '',
      };
    } else {
      return undefined;
    }
  }, [activeLocale, defaultTimezone, monitoringPlot, plantingSite?.timeZone, results]);

  const rows = useMemo((): MapDrawerTableRow[] => {
    if (properties) {
      return [
        { key: strings.TREES_STEMS, value: `${properties.numTrees}` },
        { key: strings.SHRUBS, value: `${properties.numShrubs}` },
        { key: strings.SPECIES, value: `${properties.numSpecies}` },
        { key: strings.DATE, value: properties.observationDate },
      ];
    } else {
      return [];
    }
  }, [properties, strings]);

  if (isLoading) {
    return (
      <Box display={'flex'} width={'100%'} justifyContent={'center'}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    properties && (
      <Box alignItems={'center'} display={'flex'} flexDirection={'column'} width={'100%'}>
        <MapDrawerTable header={properties.monitoringPlotName} rows={rows} />
        {onViewOnMap && (
          <Box display='flex' padding={2}>
            <Button
              id='viewBiomassPlotOnMap'
              label={strings.VIEW_ON_MAP}
              onClick={onViewOnMap}
              priority='secondary'
              type='passive'
            />
          </Box>
        )}
      </Box>
    )
  );
};

export default BiomassObservationStatsDrawer;
