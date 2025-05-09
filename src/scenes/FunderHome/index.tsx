import React, { useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import TfMain from 'src/components/common/TfMain';
import { useLocalization, useUserFundingEntity } from 'src/providers';
import { requestListFunderReports } from 'src/redux/features/funder/entities/fundingEntitiesAsyncThunks';
import { selectListFunderReports } from 'src/redux/features/funder/entities/fundingEntitiesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import FunderReportView from 'src/scenes/FunderReport/FunderReportView';
import strings from 'src/strings';
import { PublishedReport } from 'src/types/AcceleratorReport';
import useStickyTabs from 'src/utils/useStickyTabs';

export default function FunderHome() {
  const { activeLocale } = useLocalization();
  const { userFundingEntity } = useUserFundingEntity();
  const [selectedProjectId, setSelectedProjectId] = useState<number>();
  const dispatch = useAppDispatch();
  const reportsResponse = useAppSelector(selectListFunderReports(selectedProjectId?.toString() ?? ''));
  const [reports, setReports] = useState<PublishedReport[]>();

  useEffect(() => {
    if ((userFundingEntity?.projects?.length ?? 0) > 0) {
      setSelectedProjectId(userFundingEntity?.projects?.[0].projectId);
    }
  }, [userFundingEntity]);

  useEffect(() => {
    if (selectedProjectId) {
      void dispatch(requestListFunderReports(selectedProjectId));
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (reportsResponse?.status === 'success') {
      setReports(reportsResponse.data);
    }
  }, [reportsResponse]);

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }
    return [
      {
        id: 'projectProfile',
        label: strings.PROJECT_PROFILE,
        children: <Box>Project Profile</Box>,
      },
      {
        id: 'report',
        label: strings.REPORT,
        children: (
          <FunderReportView
            selectedProjectId={selectedProjectId}
            reports={reports}
            userFundingEntity={userFundingEntity}
          />
        ),
      },
    ];
  }, [activeLocale, userFundingEntity, selectedProjectId]);

  const { activeTab, onTabChange } = useStickyTabs({
    defaultTab: 'projectProfile',
    tabs,
    viewIdentifier: 'funder-home',
    keepQuery: false,
  });

  return (
    <TfMain>
      <Box
        component='main'
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box>
          <Tabs activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
        </Box>
      </Box>
    </TfMain>
  );
}
