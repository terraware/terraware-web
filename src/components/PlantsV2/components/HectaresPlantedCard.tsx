import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { Box, LinearProgress, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import React, { useMemo } from 'react';
import { useAppSelector } from 'src/redux/store';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { ObservationResults } from 'src/types/Observations';
import { getShortDate } from 'src/utils/dateFormatter';
import { useLocalization } from 'src/providers';

type HectaresPlantedCardProps = {
  plantingSiteId: number;
  observation?: ObservationResults;
};

export default function HectaresPlantedCard({ plantingSiteId, observation }: HectaresPlantedCardProps): JSX.Element {
  const theme = useTheme();
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const locale = useLocalization();

  const totalArea = plantingSite?.areaHa ?? 0;
  const totalPlantedArea = useMemo(() => {
    return (
      plantingSite?.plantingZones
        ?.flatMap((zone) => zone.plantingSubzones)
        ?.reduce((prev, curr) => (curr.plantingCompleted ? +curr.areaHa + prev : prev), 0) ?? 0
    );
  }, [plantingSite]);
  const percentagePlanted = totalArea > 0 ? Math.round((totalPlantedArea / totalArea) * 100) : 0;

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(5)}>
            {observation?.completedTime
              ? strings.formatString(
                  strings.HECTARES_PLANTED_CARD_TITLE,
                  getShortDate(observation.completedTime, locale.activeLocale)
                )
              : ''}
          </Typography>
          <Box display={'flex'} alignItems='baseline'>
            <Typography fontSize='84px' fontWeight={600} lineHeight={1} marginBottom={theme.spacing(3)}>
              {totalPlantedArea}
            </Typography>
            <Typography fontSize='24px' fontWeight={600} lineHeight={1} marginBottom={theme.spacing(3)}>
              {strings.HECTARES}
            </Typography>
          </Box>
          <Typography
            fontSize='20px'
            fontWeight={600}
            lineHeight={1}
            marginBottom={theme.spacing(2)}
            textAlign='center'
          >
            {strings.formatString(strings.PERCENTAGE_OF_SITE_PLANTED, percentagePlanted)}
          </Typography>
          <LinearProgress
            variant='determinate'
            value={totalPlantedArea}
            valueBuffer={totalArea}
            sx={{
              height: '32px',
              borderRadius: '4px',
              backgroundColor: theme.palette.TwClrBaseGray100,
              '& span': { backgroundColor: theme.palette.TwClrBgBrand },
            }}
          />
          <Typography
            fontSize='16px'
            fontWeight={600}
            lineHeight={1}
            marginTop={theme.spacing(2)}
            marginBottom={theme.spacing(2)}
            textAlign='right'
            color={theme.palette.TwClrBaseBlue500}
          >
            {strings.formatString(strings.TARGET_HECTARES_PLANTED, totalArea)}
          </Typography>
          <Typography fontSize='12px' fontWeight={400} marginBottom={theme.spacing(1.5)}>
            {strings.HECTARES_PLANTED_DESCRIPTION_1}
          </Typography>
          <Typography fontSize='12px' fontWeight={400}>
            {strings.HECTARES_PLANTED_DESCRIPTION_2}
          </Typography>
        </Box>
      }
    />
  );
}
