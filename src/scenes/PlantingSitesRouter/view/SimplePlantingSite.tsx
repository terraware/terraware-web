import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import SimplePlantingSiteMap from 'src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap';
import strings from 'src/strings';
import { MinimalPlantingSite } from 'src/types/Tracking';

type SimplePlantingSiteProps = {
  plantingSite: MinimalPlantingSite;
};

export default function SimplePlantingSite({ plantingSite }: SimplePlantingSiteProps): JSX.Element {
  const theme = useTheme();

  return (
    <>
      <Box display='flex' flexDirection='column' width='100%' padding={theme.spacing(3, 0, 0, 0)}>
        <Typography fontSize='16px' fontWeight={600} margin={theme.spacing(3, 0)}>
          {strings.SITE_MAP}
        </Typography>
        {plantingSite.boundary && <SimplePlantingSiteMap plantingSiteId={plantingSite.id} />}
      </Box>
    </>
  );
}
