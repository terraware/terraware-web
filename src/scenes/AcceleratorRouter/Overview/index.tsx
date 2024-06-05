import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import Page from 'src/components/Page';
import { useLocalization, useUser } from 'src/providers';
import CohortsListView from 'src/scenes/AcceleratorRouter/Cohorts/CohortsListView';
import ParticipantProjectsList from 'src/scenes/AcceleratorRouter/ParticipantProjects/ListView';
import ParticipantsList from 'src/scenes/AcceleratorRouter/Participants/ParticipantsList';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

const OverviewView = () => {
  const { isAllowed } = useUser();
  const { activeLocale } = useLocalization();

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }
    const canReadParticipants = isAllowed('READ_PARTICIPANTS');
    return [
      {
        id: 'projects',
        label: strings.PROJECTS,
        children: <ParticipantProjectsList />,
      },
      ...(canReadParticipants
        ? [
            {
              id: 'participants',
              label: strings.PARTICIPANTS,
              children: <ParticipantsList />,
            },
          ]
        : []),
      {
        id: 'cohorts',
        label: strings.COHORTS,
        children: <CohortsListView />,
      },
    ];
  }, [activeLocale, isAllowed]);

  const { activeTab, onTabChange } = useStickyTabs({
    defaultTab: 'projects',
    tabs,
    viewIdentifier: 'accelerator-overview',
  });

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
        <Tabs activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default OverviewView;
