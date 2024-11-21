import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import Page from 'src/components/Page';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

import ApplicationListTab from './ApplicationListTab';

const ApplicationListView = () => {
  const { activeLocale } = useLocalization();

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }
    return [
      {
        id: 'prescreen',
        label: strings.PRESCREEN,
        children: <ApplicationListTab isPrescreen />,
      },
      {
        id: 'applications',
        label: strings.APPLICATIONS,
        children: <ApplicationListTab isPrescreen={false} />,
      },
    ];
  }, [activeLocale]);

  const { activeTab, onTabChange } = useStickyTabs({
    defaultTab: 'prescreen',
    tabs,
    viewIdentifier: 'accelerator-application-list',
    keepQuery: false,
  });

  return (
    <Page title={strings.APPLICATIONS} contentStyle={{ display: 'block' }}>
      <Box
        display='flex'
        flexDirection='column'
        flexGrow={1}
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
        <Tabs activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default ApplicationListView;
