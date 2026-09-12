import React, { type JSX, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { useGetOneObservationResults } from 'src/hooks/observations';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization } from 'src/providers';
import { ObservationResultsPayload } from 'src/queries/generated/observations';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import useFilteredObservationResults from '../useFilteredObservationResults';
import { ObservationTypeFilter, PlotType } from '../useObservationFilters';
import ObservationMap from './ObservationMap';
import ObservationTimeline from './ObservationTimeline';

type ObservationMapWrapperProps = {
  isMapVisible?: boolean;
  observationId?: number;
  // The map and timeline show the same plots the list is filtered to.
  observationType?: ObservationTypeFilter;
  plantingSiteId?: number;
  plotType?: PlotType;
  selectPlantingSiteId?: (siteId: number) => void;
};

const ObservationMapWrapper = ({
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
  const { observations } = useFilteredObservationResults({
    enabled: plantingSiteId !== undefined && !observationId,
    includeUpcoming: true,
    observationType,
    plantingSiteId,
    plotType,
  });

  const isAdHoc = plotType === 'adHoc';

  const singleObservationResult = useMemo(
    () => getObservationResultResponse.data?.observation,
    [getObservationResultResponse.data?.observation]
  );

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
      {plantingSite && !singleObservationResult && (
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
      <ObservationMap
        adHocObservationResults={
          singleObservationResult ? [singleObservationResult] : isAdHoc ? selectedObservationResults : []
        }
        isBiomass={observationType === 'Biomass Measurements'}
        isSingleView={!!singleObservationResult}
        mapRef={mapRef}
        observationResults={
          singleObservationResult ? [singleObservationResult] : isAdHoc ? [] : selectedObservationResults
        }
        plantingSiteId={plantingSiteId}
        selectPlantingSiteId={selectPlantingSiteId}
      />
    </Box>
  );
};

export default ObservationMapWrapper;
