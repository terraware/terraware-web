import React, { useMemo } from 'react';

import { Box, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Tabs } from '@terraware/web-components';

import Page from 'src/components/Page';
import { useLocalization, useUser } from 'src/providers';
import CohortsListView from 'src/scenes/AcceleratorRouter/Cohorts/CohortsListView';
import ParticipantProjectsList from 'src/scenes/AcceleratorRouter/ParticipantProjects/ListView';
import ParticipantsList from 'src/scenes/AcceleratorRouter/Participants/ParticipantsList';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

const useStyles = makeStyles((theme: Theme) => ({
  tabs: {
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
  },
}));

const OverviewView = () => {
  const { isAllowed } = useUser();
  const { activeLocale } = useLocalization();
  const classes = useStyles();

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
    <Page title={strings.OVERVIEW}>
      <Box display='flex' flexDirection='column' flexGrow={1} className={classes.tabs}>
        <Tabs activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default OverviewView;
