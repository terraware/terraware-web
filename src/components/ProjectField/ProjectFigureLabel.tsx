import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { getRgbaFromHex } from 'src/utils/color';

const ProjectFigureLabel = ({ labelText }: { labelText: string }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{ background: `${getRgbaFromHex(theme.palette.TwClrBg as string, 0.5)}`, borderRadius: theme.spacing(0.5) }}
    >
      <Typography
        padding={theme.spacing(0.5, 1)}
        fontWeight={400}
        lineHeight={'24px'}
        fontSize={'14px'}
        color={theme.palette.TwClrBaseBlack}
      >
        {strings.VIEWING}: {labelText}
      </Typography>
    </Box>
  );
};

export default ProjectFigureLabel;
