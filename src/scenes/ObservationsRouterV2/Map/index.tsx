import React, { type JSX, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { useLocalization, useOrganization } from 'src/providers';
import {
  ObservationResultsPayload,
  useLazyGetObservationResultsQuery,
  useLazyListAdHocObservationResultsQuery,
  useLazyListObservationResultsQuery,
} from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ObservationMap from './ObservationMap';
import ObservationTimeline from './ObservationTimeline';

type ObservationMapWrapperProps = {
  isBiomass?: boolean;
  observationId?: number;
  plantingSiteId?: number;
  selectPlantingSiteId?: (siteId: number) => void;
};

const ObservationMapWrapper = ({
  isBiomass,
  observationId,
  plantingSiteId,
  selectPlantingSiteId,
}: ObservationMapWrapperProps): JSX.Element => {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();
  const theme = useTheme();
  const defaultTimezone = useDefaultTimeZone().get().id;
  const mapRef = useRef<MapRef | null>(null);

  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();
  const [getObservationResult, getObservationResultResponse] = useLazyGetObservationResultsQuery();
  const [listObservationResults, listObservationsResultsResponse] = useLazyListObservationResultsQuery();
  const [listAdHocObservationResults, listAdHocObservationResultsResponse] = useLazyListAdHocObservationResultsQuery();
  const [selectedObservationResults, setSelectedObservationResults] = useState<ObservationResultsPayload[]>([]);
  const [selectedAdHocObservationResults, setSelectedAdHocObservationResults] = useState<ObservationResultsPayload[]>(
    []
  );

  useEffect(() => {
    if (plantingSiteId !== undefined) {
      void getPlantingSite(plantingSiteId, true);
    }
  }, [getPlantingSite, isBiomass, plantingSiteId, selectedOrganization]);

  const plantingSite = useMemo(
    () => (plantingSiteId !== undefined ? getPlantingSiteResult.data?.site : undefined),
    [getPlantingSiteResult.data?.site, plantingSiteId]
  );

  useEffect(() => {
    if (observationId) {
      void getObservationResult({ observationId });
    }
  }, [getObservationResult, observationId]);

  useEffect(() => {
    if (selectedOrganization && plantingSiteId !== undefined && !observationId) {
      void listAdHocObservationResults(
        {
          organizationId: selectedOrganization.id,
          plantingSiteId,
          includePlants: true,
        },
        true
      );
      if (!isBiomass) {
        void listObservationResults(
          {
            organizationId: selectedOrganization.id,
            plantingSiteId,
            includePlants: true,
          },
          true
        );
      }
    }
  }, [
    isBiomass,
    listAdHocObservationResults,
    listObservationResults,
    observationId,
    plantingSiteId,
    selectedOrganization,
  ]);

  const singleObservationResult = useMemo(
    () => getObservationResultResponse.data?.observation,
    [getObservationResultResponse.data?.observation]
  );

  const adHocObservationResults = useMemo(() => {
    if (listAdHocObservationResultsResponse.isSuccess) {
      return listAdHocObservationResultsResponse.data.observations.filter(
        (observation) => observation.type === (isBiomass ? 'Biomass Measurements' : 'Monitoring')
      );
    } else {
      return [];
    }
  }, [isBiomass, listAdHocObservationResultsResponse]);

  const observationResults = useMemo(() => {
    if (listObservationsResultsResponse.isSuccess) {
      return listObservationsResultsResponse.data.observations.filter(
        (observation) => observation.type === (isBiomass ? 'Biomass Measurements' : 'Monitoring')
      );
    } else {
      return [];
    }
  }, [isBiomass, listObservationsResultsResponse]);

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
                  <FormattedNumber value={Math.round(plantingSite.areaHa * 100) / 100} />
                )}
            </Typography>
          </Box>
          <Box display={'flex'} flexGrow={1} justifyContent={'flex-end'}>
            <ObservationTimeline
              adHocObservationResults={adHocObservationResults}
              observationResults={observationResults}
              timezone={plantingSite?.timeZone ?? defaultTimezone}
              selectAdHocObservationResults={setSelectedAdHocObservationResults}
              selectObservationResults={setSelectedObservationResults}
            />
          </Box>
        </Box>
      )}
      <ObservationMap
        adHocObservationResults={singleObservationResult ? [singleObservationResult] : selectedAdHocObservationResults}
        isBiomass={isBiomass}
        isSingleView={!!singleObservationResult}
        mapRef={mapRef}
        observationResults={singleObservationResult ? [singleObservationResult] : selectedObservationResults}
        plantingSiteId={plantingSiteId}
        selectPlantingSiteId={selectPlantingSiteId}
      />
    </Box>
  );
};

export default ObservationMapWrapper;
