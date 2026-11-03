import React, { type JSX } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';

import MainPaper from 'src/components/MainPaper';
import PageHeader from 'src/components/PageHeader';
import SummaryPaper from 'src/components/common/SummaryPaper';
import TfMain from 'src/components/common/TfMain';
import { API_PULL_INTERVAL, APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { useGetOrganizationNurserySummaryQuery } from 'src/queries/generated/nurserySummaries';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import SeedlingsByStage from './SeedlingsByStage';

export default function SeedlingsDashboard(): JSX.Element {
  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const numberFormatter = useNumberFormatter();
  const theme = useTheme();
  const { currentData, isError } = useGetOrganizationNurserySummaryQuery(selectedOrganization?.id ?? skipToken, {
    pollingInterval: import.meta.env.PUBLIC_DISABLE_RECURRENT_REQUESTS ? undefined : API_PULL_INTERVAL,
  });
  const summary = currentData?.summary;
  const loading = !currentData && !isError;

  const cards = [
    {
      id: 'total-seedlings',
      title: strings.TOTAL_SEEDLINGS,
      icon: 'iconSeedling' as const,
      quantity: summary?.totalQuantity,
      link: APP_PATHS.INVENTORY,
      tooltip: strings.TOOLTIP_DASHBOARD_TOTAL_SEEDLINGS,
    },
    {
      id: 'total-batches',
      title: strings.TOTAL_BATCHES,
      icon: 'seeds' as const,
      quantity: summary?.batchesWithInventory,
      link: `${APP_PATHS.INVENTORY}?tab=batches_by_batch`,
      tooltip: strings.TOOLTIP_DASHBOARD_TOTAL_BATCHES,
    },
    {
      id: 'species',
      title: strings.NUMBER_OF_SPECIES,
      icon: 'species' as const,
      quantity: summary?.speciesWithInventory,
      link: `${APP_PATHS.INVENTORY}?tab=batches_by_species`,
    },
  ];

  return (
    <TfMain>
      <PageHeader page={strings.SEEDLINGS_DASHBOARD} parentPage={strings.SEEDLINGS} snackbarPageKey='seedlings' />
      {selectedOrganization && (
        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid key={card.id} size={isMobile ? 12 : 4}>
              <Box component='section' aria-label={card.title}>
                <MainPaper
                  sx={{
                    borderRadius: '24px',
                    border: 'none',
                    backgroundColor: theme.palette.TwClrBg,
                    padding: theme.spacing(3),
                  }}
                >
                  <SummaryPaper
                    id={card.id}
                    title={card.title}
                    icon={card.icon}
                    statistic={!loading && !isError ? numberFormatter.format(card.quantity) : undefined}
                    statisticLink={card.link}
                    loading={loading}
                    error={isError}
                    tooltipTitle={card.tooltip}
                  />
                </MainPaper>
              </Box>
            </Grid>
          ))}
          <Grid size={12}>
            <SeedlingsByStage summary={summary} loading={loading} error={isError} />
          </Grid>
        </Grid>
      )}
    </TfMain>
  );
}
