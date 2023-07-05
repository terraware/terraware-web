import React from 'react';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import { Box, Typography, useTheme } from '@mui/material';
import { getShortDate } from 'src/utils/dateFormatter';
import { ObservationResults } from 'src/types/Observations';
import { useLocalization } from 'src/providers';

type TotalMortalityRateCardProps = {
  observation?: ObservationResults;
};

export default function TotalMortalityRateCard({ observation }: TotalMortalityRateCardProps): JSX.Element {
  const theme = useTheme();
  const locale = useLocalization();

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(5)}>
            {strings.formatString(
              strings.MORTALITY_RATE_CARD_TITLE,
              observation?.completedTime ? getShortDate(observation.completedTime, locale.activeLocale) : ''
            )}
          </Typography>
          <Typography fontSize='84px' fontWeight={600} lineHeight={1}>
            {(observation?.mortalityRate ?? '0') + '%'}
          </Typography>
          <Typography fontSize='12px' fontWeight={400} marginTop={theme.spacing(2)}>
            {strings.MORTALITY_RATE_CLARIFICATION}
          </Typography>
        </Box>
      }
    />
  );
}
