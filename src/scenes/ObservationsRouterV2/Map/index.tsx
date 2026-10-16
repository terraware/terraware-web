import React, { type JSX, useEffect, useMemo, useRef } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { useGetOneObservationResults } from 'src/hooks/observations';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization } from 'src/providers';
import { getShortDate } from 'src/utils/dateFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import { ObservationTypeFilter, PlotType } from '../ObservationFiltersProvider';
import ObservationsEmptyOverlay from '../ObservationsEmptyOverlay';
import { useSelectedObservation } from '../SelectedObservationProvider';
import useFilteredObservationResults, { ObservationsEmptyState } from '../useFilteredObservationResults';
import useObservationsEmptyMessage from '../useObservationsEmptyMessage';
import ObservationMap from './ObservationMap';

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
  const { activeLocale, strings } = useLocalization();
  const theme = useTheme();
  const defaultTimezone = useDefaultTimeZone().get().id;
  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    if (isMapVisible) {
      const raf = requestAnimationFrame(() => {
        mapRef.current?.resize();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isMapVisible]);

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
  const emptyMessage = useObservationsEmptyMessage(
    observationId || plantingSiteId === undefined ? undefined : emptyState ?? emptyStateProp
  );

  const singleObservationResult = useMemo(
    () => getObservationResultResponse.data?.observation,
    [getObservationResultResponse.data?.observation]
  );

  const { selectedObservationId } = useSelectedObservation();
  const mappedObservationDate = useMemo(() => {
    if (isAdHoc) {
      return undefined;
    }

    const observation = observations.find((candidate) => candidate.observationId === selectedObservationId);
    if (!observation) {
      return undefined;
    }

    const timezone = plantingSite?.timeZone ?? defaultTimezone;
    const date = observation.completedTime
      ? getDateDisplayValue(observation.completedTime, timezone)
      : observation.startDate;
    return getShortDate(date, activeLocale);
  }, [activeLocale, defaultTimezone, isAdHoc, observations, plantingSite?.timeZone, selectedObservationId]);

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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(0.5) }}>
        {mappedObservationDate && (
          <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
            {strings.formatString(strings.SHOWING_OBSERVATION_ON_MAP, mappedObservationDate)}
          </Typography>
        )}
        <Box sx={{ position: 'relative' }}>
          <ObservationMap
            adHocObservationResults={singleObservationResult ? [singleObservationResult] : isAdHoc ? observations : []}
            isAdHoc={isAdHoc}
            isBiomass={observationType === 'Biomass Measurements'}
            isSingleView={!!singleObservationResult}
            mapRef={mapRef}
            observationResults={singleObservationResult ? [singleObservationResult] : isAdHoc ? [] : observations}
            plantingSiteId={plantingSiteId}
            selectPlantingSiteId={selectPlantingSiteId}
          />
          {emptyMessage && <ObservationsEmptyOverlay message={emptyMessage} />}
        </Box>
      </Box>
    </Box>
  );
};

export default ObservationMapWrapper;
