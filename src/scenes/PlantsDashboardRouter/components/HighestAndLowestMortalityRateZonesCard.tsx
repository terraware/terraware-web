import React, { useEffect, useState } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import isEnabled from 'src/features';
import { selectObservationPlantingZone } from 'src/redux/features/observations/observationPlantingZoneSelectors';
import {
  selectLatestObservation,
  selectPlantingSiteObservationsSummaries,
} from 'src/redux/features/observations/observationsSelectors';
import { requestGetPlantingSiteObservationsSummaries } from 'src/redux/features/observations/observationsThunks';
import { selectPlantingZone } from 'src/redux/features/observations/plantingSiteDetailsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import {
  ObservationPlantingZoneResults,
  ObservationSummary,
  PlantingZoneObservationSummary,
} from 'src/types/Observations';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

type HighestAndLowestMortalityRateCardProps = {
  plantingSiteId: number;
};

export default function TotalMortalityRateCard({
  plantingSiteId,
}: HighestAndLowestMortalityRateCardProps): JSX.Element {
  const theme = useTheme();
  const defaultTimeZone = useDefaultTimeZone();
  const observation = useAppSelector((state) =>
    selectLatestObservation(state, plantingSiteId, defaultTimeZone.get().id)
  );
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const plantingObservationsSummaryResponse = useAppSelector((state) =>
    selectPlantingSiteObservationsSummaries(state, requestId)
  );

  const newPlantsDashboardEnabled = isEnabled('New Plants Dashboard');
  const [summaries, setSummaries] = useState<ObservationSummary[]>();

  useEffect(() => {
    if (plantingSiteId) {
      const request = dispatch(requestGetPlantingSiteObservationsSummaries(plantingSiteId));
      setRequestId(request.requestId);
    }
  }, [plantingSiteId]);

  useEffect(() => {
    if (plantingObservationsSummaryResponse?.status === 'success') {
      setSummaries(plantingObservationsSummaryResponse.data);
    }
  }, [plantingObservationsSummaryResponse]);

  let highestMortalityRate: number | undefined = undefined;
  let highestZoneId: number;

  let lowestMortalityRate = 100;
  let lowestZoneId: number;

  if (newPlantsDashboardEnabled) {
    summaries?.[0]?.plantingZones.forEach((zone: PlantingZoneObservationSummary) => {
      if (
        zone.mortalityRate !== undefined &&
        zone.mortalityRate !== null &&
        zone.mortalityRate >= (highestMortalityRate || 0)
      ) {
        highestMortalityRate = zone.mortalityRate;
        highestZoneId = zone.plantingZoneId;
      }
    });

    summaries?.[0]?.plantingZones.forEach((zone: PlantingZoneObservationSummary) => {
      if (
        zone.mortalityRate !== undefined &&
        zone.mortalityRate !== null &&
        zone.mortalityRate <= lowestMortalityRate &&
        zone.plantingZoneId !== highestZoneId
      ) {
        lowestMortalityRate = zone.mortalityRate;
        lowestZoneId = zone.plantingZoneId;
      }
    });

    const highestPlantingZone = useAppSelector((state) =>
      selectPlantingZone(state, plantingSiteId, Number(highestZoneId))
    );

    const lowestPlantingZone = useAppSelector((state) =>
      selectPlantingZone(state, plantingSiteId, Number(lowestZoneId))
    );

    return (
      <Box>
        {highestPlantingZone && highestMortalityRate !== undefined && (
          <>
            <Box sx={{ backgroundColor: '#CB4D4533', padding: 1, borderRadius: 1, marginBottom: 1 }}>
              <Typography fontSize='16px' fontWeight={400}>
                {strings.HIGHEST}
              </Typography>
              <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
                {highestPlantingZone.name}
              </Typography>
              <Typography fontSize='24px' fontWeight={600}>
                <FormattedNumber value={highestMortalityRate} />%
              </Typography>
            </Box>
            {(!lowestPlantingZone || lowestPlantingZone.id === highestPlantingZone.id) && (
              <Typography fontWeight={400} fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginTop={1}>
                {strings.SINGLE_ZONE_MORTALITY_RATE_MESSAGE}
              </Typography>
            )}
          </>
        )}
        {lowestPlantingZone && lowestPlantingZone.id !== highestPlantingZone?.id && (
          <Box sx={{ backgroundColor: ' #5D822B33', padding: 1, borderRadius: 1 }}>
            <Typography fontSize='16px' fontWeight={400}>
              {strings.LOWEST}
            </Typography>
            <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
              {lowestPlantingZone.name}
            </Typography>
            <Typography fontSize='24px' fontWeight={600}>
              <FormattedNumber value={lowestMortalityRate || 0} />%
            </Typography>
          </Box>
        )}
        {highestMortalityRate === undefined && (
          <Box sx={{ backgroundColor: theme.palette.TwClrBgSecondary, padding: 1, borderRadius: 1, marginBottom: 1 }}>
            <Typography fontSize='16px' fontWeight={400}>
              {strings.INSUFFICIENT_DATA}
            </Typography>
            <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
              {highestPlantingZone?.name || ''}
            </Typography>
            <Typography fontSize='24px' fontWeight={600}>
              -
            </Typography>
          </Box>
        )}
      </Box>
    );
  } else {
    observation?.plantingZones.forEach((zone: ObservationPlantingZoneResults) => {
      if (
        zone.hasObservedPermanentPlots &&
        zone.mortalityRate !== undefined &&
        zone.mortalityRate !== null &&
        zone.mortalityRate >= (highestMortalityRate || 0)
      ) {
        highestMortalityRate = zone.mortalityRate;
        highestZoneId = zone.plantingZoneId;
      }
    });

    observation?.plantingZones.forEach((zone: ObservationPlantingZoneResults) => {
      if (
        zone.hasObservedPermanentPlots &&
        zone.mortalityRate !== undefined &&
        zone.mortalityRate !== null &&
        zone.mortalityRate <= lowestMortalityRate &&
        zone.plantingZoneId !== highestZoneId
      ) {
        lowestMortalityRate = zone.mortalityRate;
        lowestZoneId = zone.plantingZoneId;
      }
    });

    const highestPlantingZone = useAppSelector((state) =>
      selectObservationPlantingZone(
        state,
        {
          plantingSiteId: Number(observation?.plantingSiteId),
          observationId: Number(observation?.observationId),
          plantingZoneId: Number(highestZoneId),
        },
        defaultTimeZone.get().id
      )
    );

    const lowestPlantingZone = useAppSelector((state) =>
      selectObservationPlantingZone(
        state,
        {
          plantingSiteId: Number(observation?.plantingSiteId),
          observationId: Number(observation?.observationId),
          plantingZoneId: Number(lowestZoneId),
        },
        defaultTimeZone.get().id
      )
    );

    return (
      <OverviewItemCard
        isEditable={false}
        contents={
          <Box display='flex' flexDirection='column'>
            <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(3)}>
              {strings.HIGHEST_AND_LOWEST_MORTALITY_RATE_CARD_TITLE}
            </Typography>
            <Typography fontSize='12px' fontWeight={400}>
              {strings.HIGHEST}
            </Typography>
            {highestPlantingZone && (
              <>
                <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(2)}>
                  {highestPlantingZone.plantingZoneName}
                </Typography>
                <Typography fontSize='24px' fontWeight={600}>
                  <FormattedNumber value={highestMortalityRate || 0} />%
                </Typography>
                {(!lowestPlantingZone || lowestPlantingZone.plantingZoneId === highestPlantingZone.plantingZoneId) && (
                  <Typography
                    fontWeight={400}
                    fontSize='12px'
                    lineHeight='16px'
                    color={theme.palette.gray[800]}
                    marginTop={2}
                  >
                    {strings.SINGLE_ZONE_MORTALITY_RATE_MESSAGE}
                  </Typography>
                )}
              </>
            )}
            {lowestPlantingZone && lowestPlantingZone.plantingZoneId !== highestPlantingZone?.plantingZoneId && (
              <>
                <Divider sx={{ marginY: theme.spacing(2) }} />
                <Typography fontSize='12px' fontWeight={400}>
                  {strings.LOWEST}
                </Typography>
                <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(2)}>
                  {lowestPlantingZone.plantingZoneName}
                </Typography>
                <Typography fontSize='24px' fontWeight={600}>
                  <FormattedNumber value={lowestMortalityRate || 0} />%
                </Typography>
              </>
            )}
          </Box>
        }
      />
    );
  }
}
