import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import strings from 'src/strings';
import { ExistingTreePayload } from 'src/types/Observations';

import LiveTreesPerSpecies from './LiveTreesPerSpecies';

type BiomassObservationDataTabProps = {
  trees?: ExistingTreePayload[];
};

const BiomassObservationDataTab = ({ trees }: BiomassObservationDataTabProps) => {
  const theme = useTheme();
  return (
    <Card radius='24px'>
      <Typography
        fontSize='20px'
        lineHeight='28px'
        fontWeight={600}
        color={theme.palette.TwClrTxt}
        paddingBottom={2}
        paddingTop={3}
      >
        {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
      </Typography>
      <Box height='360px'>
        <LiveTreesPerSpecies trees={trees} />
      </Box>
    </Card>
  );
};

export default BiomassObservationDataTab;
