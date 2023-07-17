/**
 * Nursery plantings and withdrawals
 */
import React, { useEffect, useRef } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Tabs } from '@terraware/web-components';
import strings from 'src/strings';
import { useOrganization } from 'src/providers';
import { useAppDispatch } from 'src/redux/store';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import PlantingProgress from './PlantingProgressTabContent';
import NurseryWithdrawals from './NurseryWithdrawalsTabContent';

export default function NurseryPlantingsAndWithdrawals(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const contentRef = useRef(null);
  const dispatch = useAppDispatch();

  /**
   * TODO: initialize data, url params etc.
   */
  useEffect(() => {
    dispatch(requestPlantings(selectedOrganization.id));
    // TODO: dispatch withdrawals if needed
  }, [dispatch, selectedOrganization.id]);

  return (
    <TfMain>
      <Box sx={{ paddingLeft: theme.spacing(3) }}>
        <Grid container spacing={3} sx={{ marginTop: 0 }}>
          <PageHeaderWrapper nextElement={contentRef.current}>
            <Grid container spacing={3} sx={{ paddingLeft: theme.spacing(3), paddingBottom: theme.spacing(4) }}>
              <Grid item xs={8}>
                <Typography sx={{ marginTop: 0, marginBottom: 0, fontSize: '24px', fontWeight: 600 }}>
                  {strings.WITHDRAWALS}
                </Typography>
              </Grid>
            </Grid>
          </PageHeaderWrapper>
          <Grid item xs={12}>
            <PageSnackbar />
          </Grid>
          <Box ref={contentRef} display='flex' flexDirection='column' flexGrow={1}>
            <Tabs
              tabs={[
                { label: strings.PLANTING_PROGRESS, children: <PlantingProgress /> },
                { label: strings.WITHDRAWAL_HISTORY, children: <NurseryWithdrawals /> },
              ]}
            />
          </Box>
        </Grid>
      </Box>
    </TfMain>
  );
}
