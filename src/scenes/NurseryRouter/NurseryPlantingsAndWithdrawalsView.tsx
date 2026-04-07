/**
 * Nursery withdrawals
 */
import React, { type JSX, useRef } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import strings from 'src/strings';

import NurseryWithdrawals from './NurseryWithdrawalsTabContent';

export default function NurseryPlantingsAndWithdrawalsView(): JSX.Element {
  const theme = useTheme();
  const contentRef = useRef(null);

  return (
    <TfMain>
      <Box sx={{ paddingLeft: theme.spacing(3) }} display='flex' flexDirection='column' flexGrow={1}>
        <Grid container spacing={3} sx={{ marginTop: 0 }} display='flex' flexDirection='column' flexGrow={1}>
          <PageHeaderWrapper nextElement={contentRef.current}>
            <Grid container spacing={3} sx={{ paddingLeft: theme.spacing(3), paddingBottom: theme.spacing(2) }}>
              <Grid item xs={8}>
                <Typography sx={{ marginTop: 0, marginBottom: 0, fontSize: '24px', fontWeight: 600 }}>
                  {strings.WITHDRAWALS}
                </Typography>
              </Grid>
            </Grid>
            <PageSnackbar />
          </PageHeaderWrapper>
          <Box ref={contentRef} display='flex' flexDirection='column' flexGrow={1} maxWidth='100%'>
            <NurseryWithdrawals />
          </Box>
        </Grid>
      </Box>
    </TfMain>
  );
}
