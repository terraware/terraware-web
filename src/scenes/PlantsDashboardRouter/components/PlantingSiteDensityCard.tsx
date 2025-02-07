import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import useObservationSummaries from 'src/hooks/useObservationSummaries';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

type PlantingSiteDensityCardProps = {
  plantingSiteId: number;
};

export default function PlantingSiteDensityCard({ plantingSiteId }: PlantingSiteDensityCardProps): JSX.Element {
  const theme = useTheme();
  const summaries = useObservationSummaries(plantingSiteId);
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));

  const everySubzoneHasObservation = useMemo(() => {
    if (!summaries || summaries.length === 0 || !plantingSite) {
      return true;
    }

    const allSubzones = plantingSite.plantingZones?.flatMap((zone) => zone.plantingSubzones);
    const allSubzonesObserved = summaries[0].plantingZones.flatMap((zone) => zone.plantingSubzones);
    return allSubzones?.every((subzone) =>
      allSubzonesObserved.find(
        (subzoneObv) => subzoneObv.plantingSubzoneId === subzone.id && subzoneObv.monitoringPlots.length > 0
      )
    );
  }, [summaries]);

  return (
    <Box>
      <Typography fontSize='48px' fontWeight={600} lineHeight={1} marginBottom={theme.spacing(2)}>
        {summaries?.[0]?.plantingDensity ?? 0}
      </Typography>
      <Typography fontSize='16px' fontWeight={600} lineHeight={1} marginBottom={theme.spacing(2)}>
        {`${strings.PLANTS_PER_HECTARE.charAt(0).toUpperCase()}${strings.PLANTS_PER_HECTARE.slice(1)}`}
      </Typography>
      {!everySubzoneHasObservation && (
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
