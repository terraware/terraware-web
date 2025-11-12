import React from 'react';

import { Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import strings from 'src/strings';

const InvasiveAndThreatenedSpeciesTab = () => {
  const theme = useTheme();
  return (
    <Card radius='24px'>
      <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
        {strings.PHOTO_NORTHEAST_QUADRAT}
      </Typography>
    </Card>
  );
};

export default InvasiveAndThreatenedSpeciesTab;
