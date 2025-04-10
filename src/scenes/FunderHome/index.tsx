import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import TfMain from 'src/components/common/TfMain';
import { useLocalization } from 'src/providers';
import FunderReportView from 'src/scenes/FunderReport/FunderReportView';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

export default function FunderHome() {
  const { activeLocale } = useLocalization();

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
        children: <FunderReportView />,
      },
    ];
  }, [activeLocale]);

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
