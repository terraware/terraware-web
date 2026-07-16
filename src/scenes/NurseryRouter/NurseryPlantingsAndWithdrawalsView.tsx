/**
 * Nursery withdrawals
 */
import React, { type JSX, useEffect, useMemo, useRef } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import PlantingSeasonNotificationBanners from 'src/components/common/PlantingSeasonNotificationBanners';
import TfMain from 'src/components/common/TfMain';
import { useOrganization } from 'src/providers';
import { useLazyListPlantingSeasonsQuery } from 'src/queries/generated/plantingSeasons';
import { useLazyListPlantingDateRequestsQuery } from 'src/queries/search/plantingDateRequests';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

import NurseryWithdrawals from './NurseryWithdrawalsTabContent';
import PlantingDateRequestsTabContent from './PlantingDateRequestsTabContent';

export default function NurseryPlantingsAndWithdrawalsView(): JSX.Element {
  const theme = useTheme();
  const contentRef = useRef(null);
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;

  const [listPlantingSeasons, { data: plantingSeasonsData }] = useLazyListPlantingSeasonsQuery();
  const [listPlantingDateRequests, { data: requests }] = useLazyListPlantingDateRequestsQuery();

  useEffect(() => {
    if (organizationId) {
      void listPlantingSeasons({ organizationId }, true);
    }
  }, [listPlantingSeasons, organizationId]);

  const hasPlantingSeasons = (plantingSeasonsData?.seasons.length ?? 0) > 0;

  useEffect(() => {
    if (organizationId && hasPlantingSeasons) {
      void listPlantingDateRequests({ organizationId }, true);
    }
  }, [listPlantingDateRequests, organizationId, hasPlantingSeasons]);

  const requestsCount = requests?.length ?? 0;

  const tabs = useMemo(
    () => [
      {
        id: 'withdrawals',
        label: strings.WITHDRAWALS,
        children: <NurseryWithdrawals />,
      },
      {
        id: 'requests',
        label: strings.formatString(strings.REQUESTS_X, requestsCount).toString(),
        children: <PlantingDateRequestsTabContent />,
      },
    ],
    [requestsCount]
  );

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'withdrawals',
    tabs,
    viewIdentifier: 'nursery-withdrawals',
  });

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
            {hasPlantingSeasons ? (
              <>
                <PlantingSeasonNotificationBanners
                  organizationId={organizationId}
                  notificationPage='Withdrawals'
                  marginBottom={theme.spacing(3)}
                />
                <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
              </>
            ) : (
              <NurseryWithdrawals />
            )}
          </Box>
        </Grid>
      </Box>
    </TfMain>
  );
}
