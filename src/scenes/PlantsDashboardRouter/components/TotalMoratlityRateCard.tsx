import React, { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';
import { getShortDate } from 'src/utils/dateFormatter';

export default function TotalMortalityRateCard(): JSX.Element {
  const theme = useTheme();
  const locale = useLocalization();
  const { latestObservation } = usePlantingSiteData();

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(5)}>
            {strings.formatString(
              strings.MORTALITY_RATE_CARD_TITLE,
              latestObservation?.completedTime ? getShortDate(latestObservation.completedTime, locale.activeLocale) : ''
            )}
          </Typography>
          <Box display='flex' sx={{ flexFlow: 'row wrap' }}>
            <Typography fontSize='84px' fontWeight={600} lineHeight={1}>
              {latestObservation?.mortalityRate ? <FormattedNumber value={latestObservation?.mortalityRate} /> : '--'}
            </Typography>
            <Typography fontSize='84px' fontWeight={600} lineHeight={1}>
              %
            </Typography>
          </Box>
          <Typography fontSize='12px' fontWeight={400} marginTop={theme.spacing(2)}>
            {strings.MORTALITY_RATE_CLARIFICATION}
          </Typography>
        </Box>
      }
    />
  );
}
