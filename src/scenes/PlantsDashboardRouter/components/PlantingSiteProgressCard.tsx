import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { selectSiteReportedPlants } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

type PlantingSiteProgressCardProps = {
  plantingSiteId: number;
};

export default function PlantingSiteProgressCard({ plantingSiteId }: PlantingSiteProgressCardProps): JSX.Element {
  const theme = useTheme();
  const reportedPlants = useAppSelector((state) => selectSiteReportedPlants(state, plantingSiteId));

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(5)}>
            {strings.PLANTING_PROGRESS_CARD_TITLE}
          </Typography>
          <Typography fontSize='84px' fontWeight={600} lineHeight={1} marginBottom={theme.spacing(3)}>
            <FormattedNumber value={reportedPlants?.progressPercent ?? 0} />%
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
