import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import React, { useMemo } from 'react';
import { useAppSelector } from 'src/redux/store';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import ProgressChart from 'src/components/common/Chart/ProgressChart';
import FormattedNumber from 'src/components/common/FormattedNumber';
import Link from 'src/components/common/Link';

type HectaresPlantedCardProps = {
  plantingSiteId: number;
};

export default function HectaresPlantedCard({ plantingSiteId }: HectaresPlantedCardProps): JSX.Element {
  const theme = useTheme();
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));

  const totalArea = plantingSite?.areaHa ?? 0;
  const totalPlantedArea = useMemo(() => {
    return (
      plantingSite?.plantingZones
        ?.flatMap((zone) => zone.plantingSubzones)
        ?.reduce((prev, curr) => (curr.plantingCompleted ? +curr.areaHa + prev : prev), 0) ?? 0
    );
  }, [plantingSite]);
  const percentagePlanted = totalArea > 0 ? Math.round((totalPlantedArea / totalArea) * 100) : 0;

  const numPlantingComplete =
    plantingSite?.plantingZones
      ?.flatMap((zone) => zone.plantingSubzones)
      ?.filter((subzone) => subzone.plantingCompleted).length ?? 0;
  const numZones = plantingSite?.plantingZones?.flatMap((zone) => zone.plantingSubzones)?.length ?? 0;

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(5)} sx={{ flexFlow: 'row wrap' }}>
            {strings.HECTARES_PLANTED_CARD_TITLE}
          </Typography>
          <Box display={'flex'} alignItems='baseline' sx={{ flexFlow: 'row wrap' }}>
            <Typography fontSize='84px' fontWeight={600} lineHeight={1} marginBottom={theme.spacing(3)}>
              <FormattedNumber value={Math.round(totalPlantedArea) || 0} />
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
          <ProgressChart value={totalPlantedArea} target={totalArea} />
          <Typography
            fontSize='16px'
            fontWeight={600}
            lineHeight={1}
            marginTop={theme.spacing(2)}
            marginBottom={theme.spacing(2)}
            textAlign='right'
            color={theme.palette.TwClrBaseBlue500}
          >
            {strings.formatString(strings.TARGET_HECTARES_PLANTED, <FormattedNumber value={totalArea || 0} />)}
          </Typography>
          <Typography fontSize='12px' fontWeight={400} marginBottom={theme.spacing(1.5)}>
            {strings.HECTARES_PLANTED_DESCRIPTION_1}
          </Typography>
          <Typography fontSize='12px' fontWeight={400} marginBottom={theme.spacing(1.5)}>
            {strings.HECTARES_PLANTED_DESCRIPTION_2}
            &nbsp;
            {numPlantingComplete === numZones && numZones
              ? strings.formatString(strings.HECTARES_PLANTED_DESCRIPTION_3_COMPLETE, numZones)
              : strings.formatString(strings.HECTARES_PLANTED_DESCRIPTION_3_INCOMPLETE, numPlantingComplete, numZones)}
          </Typography>
          <Typography fontSize='12px' fontWeight={400} marginBottom={theme.spacing(1.5)}>
            {strings.HECTARES_PLANTED_DESCRIPTION_4}
          </Typography>
          <Link to={APP_PATHS.NURSERY_WITHDRAWALS}>
            <Typography fontSize='14px' fontWeight={500}>
              {strings.HECTARES_PLANTED_DESCRIPTION_LINK}
            </Typography>
          </Link>
        </Box>
      }
    />
  );
}
