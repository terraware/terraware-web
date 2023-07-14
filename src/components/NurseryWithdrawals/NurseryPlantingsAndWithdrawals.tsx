/**
 * Nursery plantings and withdrawals
 */
import React, { useRef } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Tabs } from '@terraware/web-components';
import strings from 'src/strings';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import Card from 'src/components/common/Card';
import PlantingProgress from './PlantingProgressTabContent';
import NurseryWithdrawals from './NurseryWithdrawalsTabContent';

export default function NurseryPlantingsAndWithdrawals(): JSX.Element {
  const theme = useTheme();
  const contentRef = useRef(null);

  /**
   * TODO: initialize data, url params etc.
   */

  return (
    <TfMain>
      <Box sx={{ paddingLeft: theme.spacing(3) }}>
        <Grid container spacing={3} sx={{ marginTop: 0 }}>
          <PageHeaderWrapper nextElement={contentRef.current}>
            <Grid container spacing={3} sx={{ paddingLeft: theme.spacing(3), paddingBottom: theme.spacing(4) }}>
              <Grid item xs={8}>
                <Typography sx={{ marginTop: 0, marginBottom: 0, fontSize: '24px', fontWeight: 600 }}>
                  {strings.WITHDRAWAL_LOG}
                </Typography>
              </Grid>
            </Grid>
          </PageHeaderWrapper>
          <Grid item xs={12}>
            <PageSnackbar />
          </Grid>
          <Box ref={contentRef} display='flex' flexDirection='column' flexGrow={1}>
            <Card flushMobile style={{ minWidth: 'fit-content' }}>
              <Tabs
                tabs={[
                  { label: strings.PLANTING_PROGRESS, children: <PlantingProgress /> },
                  { label: strings.WITHDRAWAL_HISTORY, children: <NurseryWithdrawals /> },
                ]}
              />
            </Card>
          </Box>
        </Grid>
      </Box>
    </TfMain>
  );
}
