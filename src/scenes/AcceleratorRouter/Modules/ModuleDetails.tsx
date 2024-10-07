import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import strings from 'src/strings';
import { Module } from 'src/types/Module';

interface ModuleDetailsProps {
  module?: Module;
}

export default function ModuleDetails({ module }: ModuleDetailsProps): JSX.Element {
  const theme = useTheme();

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
        marginBottom={theme.spacing(3)}
        paddingBottom={theme.spacing(3)}
      >
        <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} sx={{ flexGrow: 1 }}>
          {strings.DETAILS}
        </Typography>
      </Box>
      <Grid container>
        <Grid
          item
          sx={{ borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}` }}
          marginBottom={theme.spacing(3)}
          paddingBottom={theme.spacing(3)}
        >
          <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt}>
            {strings.OVERVIEW}
          </Typography>
          <Box dangerouslySetInnerHTML={{ __html: module?.overview || '' }} />
        </Grid>
        <Grid item>
          <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} paddingBottom={1}>
            {strings.COHORTS_AND_PROJECTS}
          </Typography>
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxt}>
            {strings.COHORTS_AND_PROJECTS_DESCRIPTION}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
}
