import React, { type JSX, useMemo } from 'react';

import { Box, CircularProgress } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';
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
  plantingSiteId: number;
};

const BiomassObservationStatsDrawer = ({
  observationId,
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

  const properties = useMemo((): BiomassObservationStatsProperties | undefined => {
    if (results && results.adHocPlot && results.biomassMeasurements) {
      const completedDate = results.completedTime
        ? getDateDisplayValue(results.completedTime, plantingSite?.timeZone ?? defaultTimezone)
        : undefined;
      return {
        monitoringPlotName: results.adHocPlot.monitoringPlotName,
        numTrees: results.biomassMeasurements.trees.filter((tree) => tree.treeGrowthForm !== 'Shrub').length,
        numShrubs: results.biomassMeasurements.trees.filter((tree) => tree.treeGrowthForm === 'Shrub').length,
        numSpecies: results.biomassMeasurements.treeSpeciesCount,
        observationDate: completedDate ? getShortDate(completedDate, activeLocale) : '',
      };
    } else {
      return undefined;
    }
  }, [activeLocale, defaultTimezone, plantingSite?.timeZone, results]);

  const rows = useMemo((): MapDrawerTableRow[] => {
    if (properties) {
      return [
        { key: strings.TREES_STEMS, value: `${properties.numTrees}` },
        { key: strings.SHRUBS, value: `${properties.numShrubs}` },
        { key: strings.SPECIES, value: `${properties.numSpecies}` },
        { key: strings.DATE, value: `${properties.numSpecies}` },
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
      <Box display={'flex'} width={'100%'}>
        <MapDrawerTable header={properties.monitoringPlotName} rows={rows} />
      </Box>
    )
  );
};

export default BiomassObservationStatsDrawer;
