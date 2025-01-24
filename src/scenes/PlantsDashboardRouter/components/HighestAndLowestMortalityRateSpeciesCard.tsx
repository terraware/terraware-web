import React, { useEffect, useState } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import isEnabled from 'src/features';
import {
  selectLatestObservation,
  selectPlantingSiteObservationsSummaries,
} from 'src/redux/features/observations/observationsSelectors';
import { requestGetPlantingSiteObservationsSummaries } from 'src/redux/features/observations/observationsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { useSpecies } from 'src/scenes/InventoryRouter/form/useSpecies';
import strings from 'src/strings';
import { ObservationSpeciesResultsPayload, ObservationSummary } from 'src/types/Observations';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

type HighestAndLowestMortalityRateSpeciesCardProps = {
  plantingSiteId: number;
};

export default function HighestAndLowestMortalityRateSpeciesCard({
  plantingSiteId,
}: HighestAndLowestMortalityRateSpeciesCardProps): JSX.Element {
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

  const { availableSpecies } = useSpecies();

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

  let highestMortalityRate = 0;
  let highestSpecies = '';

  let lowestMortalityRate = 100;
  let lowestSpecies = '';

  if (newPlantsDashboardEnabled) {
    summaries?.[0]?.species.forEach((sp: ObservationSpeciesResultsPayload) => {
      if (sp.mortalityRate !== undefined && sp.mortalityRate !== null && sp.mortalityRate >= highestMortalityRate) {
        highestMortalityRate = sp.mortalityRate;
        highestSpecies =
          availableSpecies?.find((spec) => spec.id === sp.speciesId)?.scientificName || sp.speciesName || '';
      }
    });

    summaries?.[0]?.species.forEach((sp: ObservationSpeciesResultsPayload) => {
      if (sp.mortalityRate !== undefined && sp.mortalityRate !== null && sp.mortalityRate <= lowestMortalityRate) {
        lowestMortalityRate = sp.mortalityRate;
        lowestSpecies =
          availableSpecies?.find((spec) => spec.id === sp.speciesId)?.scientificName || sp.speciesName || '';
      }
    });
  } else {
    observation?.species.forEach((sp) => {
      if (sp.mortalityRate !== undefined && sp.mortalityRate !== null && sp.mortalityRate >= highestMortalityRate) {
        highestMortalityRate = sp.mortalityRate;
        highestSpecies = sp.speciesScientificName || sp.speciesName || '';
      }
    });

    observation?.species.forEach((sp) => {
      if (sp.mortalityRate !== undefined && sp.mortalityRate !== null && sp.mortalityRate <= lowestMortalityRate) {
        lowestMortalityRate = sp.mortalityRate;
        lowestSpecies = sp.speciesScientificName || sp.speciesName || '';
      }
    });
  }

  return newPlantsDashboardEnabled ? (
    <Box>
      {highestSpecies && (
        <>
          <Box sx={{ backgroundColor: '#CB4D4533', padding: 1, borderRadius: 1, marginBottom: 1 }}>
            <Typography fontSize='16px' fontWeight={400}>
              {strings.HIGHEST}
            </Typography>
            <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
              {highestSpecies}
            </Typography>
            <Typography fontSize='24px' fontWeight={600}>
              <FormattedNumber value={highestMortalityRate || 0} />%
            </Typography>
          </Box>
          {(!lowestSpecies || lowestSpecies === highestSpecies) && (
            <Typography fontWeight={400} fontSize='14px' color={theme.palette.TwClrTxtSecondary} marginTop={1}>
              {strings.SINGLE_SPECIES_MORTALITY_RATE_MESSAGE}
            </Typography>
          )}
        </>
      )}
      {lowestSpecies && lowestSpecies !== highestSpecies && (
        <Box sx={{ backgroundColor: ' #5D822B33', padding: 1, borderRadius: 1 }}>
          <Typography fontSize='16px' fontWeight={400}>
            {strings.LOWEST}
          </Typography>
          <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(1)}>
            {lowestSpecies}
          </Typography>
          <Typography fontSize='24px' fontWeight={600}>
            <FormattedNumber value={lowestMortalityRate || 0} />%
          </Typography>
        </Box>
      )}
    </Box>
  ) : (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(3)}>
            {strings.HIGHEST_AND_LOWEST_MORTALITY_RATE_SPECIES_CARD_TITLE}
          </Typography>
          <Typography fontSize='12px' fontWeight={400}>
            {strings.HIGHEST}
          </Typography>
          {highestSpecies && (
            <>
              <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(2)}>
                {highestSpecies}
              </Typography>
              <Typography fontSize='24px' fontWeight={600}>
                <FormattedNumber value={highestMortalityRate || 0} />%
              </Typography>
              {(!lowestSpecies || lowestSpecies === highestSpecies) && (
                <Typography
                  fontWeight={400}
                  fontSize='12px'
                  lineHeight='16px'
                  color={theme.palette.gray[800]}
                  marginTop={2}
                >
                  {strings.SINGLE_SPECIES_MORTALITY_RATE_MESSAGE}
                </Typography>
              )}
            </>
          )}
          {lowestSpecies && lowestSpecies !== highestSpecies && (
            <>
              <Divider sx={{ marginY: theme.spacing(2) }} />
              <Typography fontSize='12px' fontWeight={400}>
                {strings.LOWEST}
              </Typography>
              <Typography fontSize='24px' fontWeight={600} paddingY={theme.spacing(2)}>
                {lowestSpecies}
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
