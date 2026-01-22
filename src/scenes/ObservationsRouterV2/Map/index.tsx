import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { useLocalization, useOrganization } from 'src/providers';
import {
  ObservationResultsPayload,
  useLazyListAdHocObservationResultsQuery,
  useLazyListObservationResultsQuery,
} from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ObservationMap from './ObservationMap';
import ObservationTimeline from './ObservationTimeline';

type MapProps = {
  isBiomass?: boolean;
  plantingSiteId?: number;
  selectPlantingSiteId: (siteId: number) => void;
};

const Map = ({ isBiomass, plantingSiteId, selectPlantingSiteId }: MapProps): JSX.Element => {
  const { selectedOrganization } = useOrganization();
  const { strings } = useLocalization();
  const theme = useTheme();
  const defaultTimezone = useDefaultTimeZone().get().id;

  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();
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

  const plantingSite = useMemo(() => getPlantingSiteResult.data?.site, [getPlantingSiteResult.data?.site]);

  useEffect(() => {
    if (selectedOrganization && plantingSiteId !== undefined) {
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
  }, [isBiomass, listAdHocObservationResults, listObservationResults, plantingSiteId, selectedOrganization]);

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
      {plantingSite && (
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
        adHocObservationResults={selectedAdHocObservationResults}
        isBiomass={isBiomass}
        observationResults={selectedObservationResults}
        plantingSiteId={plantingSiteId}
        selectPlantingSiteId={selectPlantingSiteId}
      />
    </Box>
  );
};

export default Map;
