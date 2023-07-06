import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import React, { useMemo } from 'react';
import { useAppSelector } from 'src/redux/store';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';

type PlantingSiteProgressCardProps = {
  plantingSiteId: number;
};

export default function PlantingSiteProgressCard({ plantingSiteId }: PlantingSiteProgressCardProps): JSX.Element {
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

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(5)}>
            {strings.PLANTING_PROGRESS_CARD_TITLE}
          </Typography>
          <Typography fontSize='84px' fontWeight={600} lineHeight={1} marginBottom={theme.spacing(3)}>
            {totalArea > 0 ? `${Math.round((100 * totalPlantedArea) / totalArea)}%` : '0%'}
          </Typography>
          <Typography fontSize='12px' fontWeight={400} marginBottom={theme.spacing(1.5)}>
            {strings.PLANTING_PROGRESS_DESCRIPTION_1}
          </Typography>
          <Typography fontSize='12px' fontWeight={400}>
            {strings.PLANTING_PROGRESS_DESCRIPTION_2}
          </Typography>
        </Box>
      }
    />
  );
}
