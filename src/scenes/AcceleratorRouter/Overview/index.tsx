import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Box, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Tabs } from '@terraware/web-components';

import Page from 'src/components/Page';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import ParticipantsList from 'src/scenes/AcceleratorRouter/Participants/ParticipantsList';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

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

// TODO: remove this component and replace it with the actual content
const TabPlaceholder = ({ name }: { name: string }) => {
  return (
    <Box display='flex' alignItems='center' justifyContent='center' flex={1} sx={{ minHeight: '400px' }}>
      {name} tab content
    </Box>
  );
};

const OverviewView = () => {
  const { isMobile } = useDeviceInfo();
  const history = useHistory();
  const classes = useStyles();
  const query = useQuery();
  const tab = query.get('tab') || 'projects';
  const location = useStateLocation();

  const [activeTab, setActiveTab] = useState<string>(tab);

  const goToNewCohort = () => {
    history.push(APP_PATHS.ACCELERATOR_COHORTS_NEW);
  };

  const onTabChange = useCallback(
    (newTab: string) => {
      query.set('tab', newTab);
      history.push(getLocation(location.pathname, location, query.toString()));
    },
    [history, location, query]
  );

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  return (
    <Page
      title={strings.OVERVIEW}
      rightComponent={
        isMobile ? (
          <Button id='new-cohort' icon='plus' onClick={goToNewCohort} size='medium' />
        ) : (
          <Button id='new-cohort' label={strings.ADD_COHORT} icon='plus' onClick={goToNewCohort} size='medium' />
        )
      }
    >
      <Box display='flex' flexDirection='column' flexGrow={1} className={classes.tabs}>
        <Tabs
          activeTab={activeTab}
          onTabChange={onTabChange}
          tabs={[
            {
              id: 'projects',
              label: strings.PROJECTS,
              children: <TabPlaceholder name={strings.PROJECTS} />,
            },
            {
              id: 'participants',
              label: strings.PARTICIPANTS,
              children: <ParticipantsList />,
            },
            {
              id: 'cohorts',
              label: strings.COHORTS,
              children: <TabPlaceholder name={strings.COHORTS} />,
            },
          ]}
        />
      </Box>
    </Page>
  );
};

export default OverviewView;
