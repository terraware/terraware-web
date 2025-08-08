/**
 * Nursery plantings and withdrawals
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { DropdownItem, Tabs } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import { useLocalization, useOrganization } from 'src/providers';
import { searchPlantingProgress } from 'src/redux/features/plantings/plantingsSelectors';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { requestPlantingSitesSearchResults } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { SearchNodePayload, SearchResponseElement } from 'src/types/Search';
import useStickyTabs from 'src/utils/useStickyTabs';

import NurseryWithdrawals from './NurseryWithdrawalsTabContent';
import PlantingProgress from './PlantingProgressTabContent';
import { exportNurseryPlantingProgress, exportNurseryWithdrawalResults } from './exportNurseryData';

export default function NurseryPlantingsAndWithdrawalsView(): JSX.Element {
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const contentRef = useRef(null);
  const dispatch = useAppDispatch();

  const [nurseryWithdrawalResults, setNurseryWithdrawalResults] = useState<SearchResponseElement[] | null>();
  const [plantingProgressFilters, setPlantingProgressFilters] = useState<Record<string, SearchNodePayload>>({});
  const [plantingProgressSearchQuery, setPlantingProgressSearchQuery] = useState<string>('');

  const plantingProgressResults = useAppSelector((state: any) =>
    searchPlantingProgress(state, plantingProgressSearchQuery.trim(), plantingProgressFilters)
  );

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      {
        id: 'planting_progress',
        label: strings.PLANTING_PROGRESS,
        children: (
          <PlantingProgress
            filters={plantingProgressFilters}
            search={plantingProgressSearchQuery}
            setFilters={setPlantingProgressFilters}
            setSearch={setPlantingProgressSearchQuery}
          />
        ),
      },
      {
        id: 'withdrawal_history',
        label: strings.WITHDRAWAL_HISTORY,
        children: <NurseryWithdrawals rows={nurseryWithdrawalResults} setRows={setNurseryWithdrawalResults} />,
      },
    ];
  }, [activeLocale, nurseryWithdrawalResults, plantingProgressFilters, plantingProgressSearchQuery]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'planting_progress',
    tabs,
    viewIdentifier: 'nursery-plantings-and-withdrawals',
  });

  const onExportPlantingProgress = useCallback(() => {
    void exportNurseryPlantingProgress({ plantingProgress: plantingProgressResults || [] });
  }, [plantingProgressResults]);

  const onExportNurseryWithdrawals = useCallback(() => {
    void exportNurseryWithdrawalResults({ nurseryWithdrawalResults: nurseryWithdrawalResults || [] });
  }, [nurseryWithdrawalResults]);

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      if (optionItem.value === 'export') {
        if (activeTab === 'planting_progress') {
          onExportPlantingProgress();
        } else if (activeTab === 'withdrawal_history') {
          onExportNurseryWithdrawals();
        }
      }
    },
    [activeTab, onExportPlantingProgress, onExportNurseryWithdrawals]
  );

  useEffect(() => {
    if (selectedOrganization) {
      void dispatch(requestPlantings(selectedOrganization.id));
      void dispatch(requestPlantingSitesSearchResults(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization]);

  return (
    <TfMain>
      <Box sx={{ paddingLeft: theme.spacing(3) }} display='flex' flexDirection='column' flexGrow={1}>
        <Grid container spacing={3} sx={{ marginTop: 0 }} display='flex' flexDirection='column' flexGrow={1}>
          <PageHeaderWrapper nextElement={contentRef.current}>
            <Grid container spacing={3} sx={{ paddingLeft: theme.spacing(3), paddingBottom: theme.spacing(4) }}>
              <Grid item xs={8}>
                <Typography sx={{ marginTop: 0, marginBottom: 0, fontSize: '24px', fontWeight: 600 }}>
                  {strings.WITHDRAWALS}
                </Typography>
              </Grid>

              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <OptionsMenu
                  onOptionItemClick={onOptionItemClick}
                  optionItems={[{ label: strings.EXPORT, value: 'export' }]}
                />
              </Grid>
            </Grid>
          </PageHeaderWrapper>
          <Grid item xs={12}>
            <PageSnackbar />
          </Grid>
          <Box
            ref={contentRef}
            display='flex'
            flexDirection='column'
            flexGrow={1}
            maxWidth='100%'
            sx={{
              '& .MuiTabPanel-root[hidden]': {
                flexGrow: 0,
              },
              '& .MuiTabPanel-root': {
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
              },
              '& >.MuiBox-root': {
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
              },
            }}
          >
            <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
          </Box>
        </Grid>
      </Box>
    </TfMain>
  );
}
