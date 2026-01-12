import React, { useCallback, useMemo } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';

import { Box } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import Page from 'src/components/Page';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization } from 'src/providers';
import CohortsListView from 'src/scenes/AcceleratorRouter/Cohorts/CohortsListView';
import ParticipantProjectsList from 'src/scenes/AcceleratorRouter/ParticipantProjects/ListView';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

const OverviewView = () => {
  const { activeLocale } = useLocalization();
  const mixpanel = useMixpanel();

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      {
        id: 'projects',
        label: strings.PROJECTS,
        children: <ParticipantProjectsList />,
      },
      {
        id: 'cohorts',
        label: strings.COHORTS,
        children: <CohortsListView />,
      },
    ];
  }, [activeLocale]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'projects',
    tabs,
    viewIdentifier: 'accelerator-overview',
  });

  const onChangeTabHandler = useCallback(
    (tab: string) => {
      if (tab !== 'projects') {
        mixpanel?.track(MIXPANEL_EVENTS.CONSOLE_OVERVIEW_TAB, {
          tab,
        });
      }
      onChangeTab(tab);
    },
    [mixpanel, onChangeTab]
  );

  return (
    <Page title={strings.OVERVIEW} contentStyle={{ display: 'block' }}>
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
        <Tabs activeTab={activeTab} onChangeTab={onChangeTabHandler} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default OverviewView;
