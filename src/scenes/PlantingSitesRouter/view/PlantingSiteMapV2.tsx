import React, { type JSX } from 'react';

import { Box, Typography } from '@mui/material';

export type PlantingSiteMapV2Props = {
  plantingSiteId: number;
};

const PlantingSiteMapV2 = ({ plantingSiteId }: PlantingSiteMapV2Props): JSX.Element => {
  return (
    <Box display='flex' flexGrow={1} alignItems='center' justifyContent='center'>
      <Typography>{`Planting site map (site ${plantingSiteId})`}</Typography>
    </Box>
  );
};

export default PlantingSiteMapV2;
