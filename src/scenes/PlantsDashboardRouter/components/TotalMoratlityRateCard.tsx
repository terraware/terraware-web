import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useLocalization } from 'src/providers';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { getShortDate } from 'src/utils/dateFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

type TotalMortalityRateCardProps = {
  plantingSiteId: number;
};

export default function TotalMortalityRateCard({ plantingSiteId }: TotalMortalityRateCardProps): JSX.Element {
  const theme = useTheme();
  const locale = useLocalization();
  const defaultTimeZone = useDefaultTimeZone();
  const observation = useAppSelector((state) =>
    selectLatestObservation(state, plantingSiteId, defaultTimeZone.get().id)
  );

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
          <Box display='flex' sx={{ flexFlow: 'row wrap' }}>
            <Typography fontSize='84px' fontWeight={600} lineHeight={1}>
              <FormattedNumber value={observation?.mortalityRate || 0} />
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
