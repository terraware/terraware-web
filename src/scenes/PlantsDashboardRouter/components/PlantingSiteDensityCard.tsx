import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import FormattedNumber from 'src/components/common/FormattedNumber';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';

export default function PlantingSiteDensityCard(): JSX.Element {
  const theme = useTheme();
  const { plantingSite, observationSummaries } = usePlantingSiteData();

  const everySubzoneHasObservation = useMemo(() => {
    if (!observationSummaries || observationSummaries.length === 0 || !plantingSite) {
      return true;
    }

    const allSubzones = plantingSite.strata?.flatMap((zone) => zone.substrata);
    const allSubzonesObserved = observationSummaries[0].strata.flatMap((zone) => zone.substrata);
    return allSubzones?.every((subzone) =>
      allSubzonesObserved.find(
        (subzoneObv) => subzoneObv.substratumId === subzone.id && subzoneObv.monitoringPlots.length > 0
      )
    );
  }, [observationSummaries, plantingSite]);

  return (
    <Box>
      <Typography fontSize='48px' fontWeight={600} lineHeight={1} marginBottom={theme.spacing(2)}>
        <FormattedNumber value={observationSummaries?.[0]?.plantingDensity ?? 0} />
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
