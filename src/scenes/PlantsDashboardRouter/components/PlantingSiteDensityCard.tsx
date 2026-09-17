import React, { type JSX, useMemo } from 'react';

import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { useLatestSiteObservationResult } from 'src/hooks/observations';
import usePlantingSite from 'src/hooks/usePlantingSite';
import strings from 'src/strings';

type PlantingDensityCardProps = {
  plantingSiteId: number;
};

export default function PlantingSiteDensityCard({ plantingSiteId }: PlantingDensityCardProps): JSX.Element {
  const theme = useTheme();
  const { plantingSite } = usePlantingSite(plantingSiteId);

  // Site-level plantingDensity needs no nested data; 'Stratum' reuses SurvivalRateCard's cache entry.
  const { observation: latestObservationResult, isLoading } = useLatestSiteObservationResult(plantingSiteId, 'Stratum');

  // Coverage means ever observed, matching how plantingDensity carries data forward.
  const everySubstratumHasObservation = useMemo(
    () =>
      (plantingSite?.strata ?? [])
        .flatMap((stratum) => stratum.substrata)
        .every((substratum) => substratum.latestObservationId !== undefined),
    [plantingSite]
  );

  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center'>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography fontSize='48px' fontWeight={600} lineHeight={1} marginBottom={theme.spacing(2)}>
        <FormattedNumber value={latestObservationResult?.plantingDensity ?? 0} />
      </Typography>
      <Typography fontSize='16px' fontWeight={600} lineHeight={1} marginBottom={theme.spacing(2)}>
        {`${strings.PLANTS_PER_HECTARE.charAt(0).toUpperCase()}${strings.PLANTS_PER_HECTARE.slice(1)}`}
      </Typography>
      {!everySubstratumHasObservation && (
        <Box display={'flex'}>
          <Box paddingRight={0.5}>
            <Icon name='warning' fillColor={theme.palette.TwClrIcnWarning} size='medium' />
          </Box>
          <Typography color={theme.palette.TwClrTxtWarning} fontSize='14px' fontWeight={400}>
            {strings.SAMPLE_OBSERVED_DENSITY_WARNING}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
