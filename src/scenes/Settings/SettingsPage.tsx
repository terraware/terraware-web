import React, { useMemo } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';

import { Box, useTheme } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import Page from 'src/components/Page';
import TitleDescription from 'src/components/common/TitleDescription';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization, useUser } from 'src/providers';
import MyAccountForm from 'src/scenes/MyAccountRouter/MyAccountForm';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

const SettingsPage = () => {
  const { activeLocale } = useLocalization();
  const mixpanel = useMixpanel();
  const theme = useTheme();
  const { user, reloadUser } = useUser();

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    if (!user) {
      return [];
    }

    return [
      {
        id: 'my-account',
        label: strings.MY_ACCOUNT,
        children: <MyAccountForm edit={false} user={{ ...user }} reloadUser={reloadUser} />,
      },
    ];
  }, [activeLocale, user, reloadUser]);

  const { activeTab, onTabChange } = useStickyTabs({
    defaultTab: 'my-account',
    tabs,
    viewIdentifier: 'settings',
    keepQuery: false,
  });

  const onTabChangeHandler = (tab: string) => {
    if (tab !== 'my-account') {
      mixpanel?.track(MIXPANEL_EVENTS.SETTINGS_TAB, {
        tab,
      });
    }
    onTabChange(tab);
  };

  return (
    <Page title={strings.SETTINGS} contentStyle={{ display: 'block' }}>
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
        marginTop={theme.spacing(4)}
      >
        <TitleDescription
          title={strings.SETTINGS}
          description={strings.MY_ACCOUNT_DESC}
          style={{
            padding: 0,
            marginLeft: theme.spacing(4),
            marginBottom: theme.spacing(2),
          }}
        />
        <Tabs activeTab={activeTab} onTabChange={onTabChangeHandler} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default SettingsPage;
