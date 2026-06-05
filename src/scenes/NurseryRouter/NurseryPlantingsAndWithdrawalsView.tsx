/**
 * Nursery withdrawals
 */
import React, { type JSX, useMemo, useRef } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import { useOrganization } from 'src/providers';
import { useListPlantingDateRequestsQuery } from 'src/queries/search/plantingDateRequests';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

import NurseryWithdrawals from './NurseryWithdrawalsTabContent';
import PlantingDateRequestsTabContent from './PlantingDateRequestsTabContent';

export default function NurseryPlantingsAndWithdrawalsView(): JSX.Element {
  const theme = useTheme();
  const contentRef = useRef(null);
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;

  const { data: requests } = useListPlantingDateRequestsQuery(
    { organizationId: organizationId ?? 0 },
    { skip: !organizationId }
  );

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
            <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
          </Box>
        </Grid>
      </Box>
    </TfMain>
  );
}
