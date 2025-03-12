import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import Tabs from '@terraware/web-components/components/Tabs';

import Page from 'src/components/Page';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

import ReportsList from './ReportsList';
import ReportsTargets from './ReportsTargets';

const ReportsView = () => {
  const { activeLocale } = useLocalization();

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      {
        id: 'reports',
        label: strings.REPORTS,
        children: <ReportsList />,
      },
      {
        id: 'targets',
        label: strings.TARGETS,
        children: <ReportsTargets />,
      },
    ];
  }, [activeLocale]);

  const { activeTab, onTabChange } = useStickyTabs({
    defaultTab: 'reports',
    tabs,
    viewIdentifier: 'reports',
    keepQuery: false,
  });

  return (
    <Page hierarchicalCrumbs={false} title={strings.REPORTS}>
      <Box display='flex' flexDirection='column' flexGrow={1}>
        <Tabs activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default ReportsView;
