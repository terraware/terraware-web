import React, { type JSX, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import isEnabled from 'src/features';
import { useGetOneObservationResults } from 'src/hooks/observations';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization } from 'src/providers';
import { ObservationResultsPayload } from 'src/queries/generated/observations';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import { ObservationTypeFilter, PlotType } from '../ObservationFiltersProvider';
import ObservationsEmptyOverlay from '../ObservationsEmptyOverlay';
import useFilteredObservationResults, { ObservationsEmptyState } from '../useFilteredObservationResults';
import useObservationsEmptyMessage from '../useObservationsEmptyMessage';
import ObservationMap from './ObservationMap';
import ObservationTimeline from './ObservationTimeline';

type ObservationMapWrapperProps = {
  emptyState?: ObservationsEmptyState;
  isMapVisible?: boolean;
  observationId?: number;
  // The map and timeline show the same plots the list is filtered to.
  observationType?: ObservationTypeFilter;
  plantingSiteId?: number;
  plotType?: PlotType;
  selectPlantingSiteId?: (siteId: number) => void;
};

const ObservationMapWrapper = ({
  emptyState: emptyStateProp,
  isMapVisible,
  observationId,
  observationType = 'Monitoring',
  plantingSiteId,
  plotType = 'assigned',
  selectPlantingSiteId,
}: ObservationMapWrapperProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const defaultTimezone = useDefaultTimeZone().get().id;
  const mapRef = useRef<MapRef | null>(null);
  const newFiltersEnabled = isEnabled('New Observation Filters');

  useEffect(() => {
    if (isMapVisible) {
      const raf = requestAnimationFrame(() => {
        mapRef.current?.resize();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isMapVisible]);

  const [selectedObservationResults, setSelectedObservationResults] = useState<ObservationResultsPayload[]>([]);

  const { plantingSite } = usePlantingSite(plantingSiteId);

  const getObservationResultResponse = useGetOneObservationResults({ observationId });

  // A single observation's results are fetched by id; the list view fetches whatever its filters ask for.
  const { emptyState, observations } = useFilteredObservationResults({
    enabled: plantingSiteId !== undefined && !observationId,
    observationType,
    plantingSiteId,
    plotType,
  });

  const isAdHoc = plotType === 'adHoc';
  const emptyMessage = useObservationsEmptyMessage(observationId ? undefined : emptyState ?? emptyStateProp);

  const singleObservationResult = useMemo(
    () => getObservationResultResponse.data?.observation,
    [getObservationResultResponse.data?.observation]
  );

  const mappedResults = newFiltersEnabled ? observations : selectedObservationResults;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.TwClrBg,
        borderRadius: '8px',
        padding: theme.spacing(1),
        gap: theme.spacing(3),
      }}
    >
      {!newFiltersEnabled && plantingSite && !singleObservationResult && (
        <Box display={'flex'} flexDirection={'row'} width={'100%'} alignItems={'center'}>
          <Box marginRight={theme.spacing(2)}>
            <Typography fontSize='20px' fontWeight={600} lineHeight={'28px'}>
              {plantingSite?.areaHa !== undefined &&
                strings.formatString(
                  strings.X_HA_IN_TOTAL_PLANTING_AREA,
                  <FormattedNumber decimals={1} value={plantingSite.areaHa} />
                )}
            </Typography>
          </Box>
          <Box display={'flex'} flexGrow={1} justifyContent={'flex-end'}>
            <ObservationTimeline
              isAdHoc={isAdHoc}
              observationResults={observations}
              selectObservationResults={setSelectedObservationResults}
              timezone={plantingSite?.timeZone ?? defaultTimezone}
            />
          </Box>
        </Box>
      )}
      <Box sx={{ position: 'relative' }}>
        <ObservationMap
          adHocObservationResults={singleObservationResult ? [singleObservationResult] : isAdHoc ? mappedResults : []}
          isAdHoc={isAdHoc}
          isBiomass={observationType === 'Biomass Measurements'}
          isSingleView={!!singleObservationResult}
          mapRef={mapRef}
          observationResults={singleObservationResult ? [singleObservationResult] : isAdHoc ? [] : mappedResults}
          plantingSiteId={plantingSiteId}
          selectPlantingSiteId={selectPlantingSiteId}
        />
        {newFiltersEnabled && emptyMessage && <ObservationsEmptyOverlay message={emptyMessage} />}
      </Box>
    </Box>
  );
};

export default ObservationMapWrapper;
