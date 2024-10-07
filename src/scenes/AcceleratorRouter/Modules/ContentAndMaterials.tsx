import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import strings from 'src/strings';
import { Module } from 'src/types/Module';

interface contentAndMaterialsProps {
  module?: Module;
}

export default function contentAndMaterials({ module }: contentAndMaterialsProps): JSX.Element {
  const theme = useTheme();

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
        marginBottom={theme.spacing(3)}
        paddingBottom={theme.spacing(3)}
      >
        <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} sx={{ flexGrow: 1 }}>
          {strings.CONTENT_AND_MATERIALS}
        </Typography>
      </Box>
      <Grid container>
        <Grid item>
          <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
            {strings.DELIVERABLES}
          </Typography>
        </Grid>
        <Grid item>
          <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
            {strings.PREPARATION_MATERIALS}
          </Typography>
          <Box dangerouslySetInnerHTML={{ __html: module?.preparationMaterials || '' }} />
        </Grid>
        <Grid item>
          <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
            {strings.ADDITIONAL_RESOURCES}
          </Typography>
          <Box dangerouslySetInnerHTML={{ __html: module?.additionalResources || '' }} />
        </Grid>
      </Grid>
    </Card>
  );
}
