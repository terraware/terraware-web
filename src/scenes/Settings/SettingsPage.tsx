import React, { useMemo, useRef, useState } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';

import { Box, useTheme } from '@mui/material';
import { Button, DropdownItem, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Page from 'src/components/Page';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
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
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);

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
        children: (
          <MyAccountForm
            edit={isEditingAccount}
            deleteOpen={isDeleteModalOpen}
            onDeleteCancel={() => setIsDeleteModalOpen(false)}
            backToView={() => setIsEditingAccount(false)}
            user={{ ...user }}
            reloadUser={reloadUser}
          />
        ),
      },
    ];
  }, [activeLocale, user, reloadUser, isEditingAccount, isDeleteModalOpen]);

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
    setIsEditingAccount(false);
    onTabChange(tab);
  };

  const onOptionItemClick = (optionItem: DropdownItem) => {
    if (optionItem.value === 'delete-account') {
      setIsDeleteModalOpen(true);
    }
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
        <PageHeaderWrapper nextElement={contentRef.current} hasNav={false}>
          <Box display='flex' justifyContent='space-between'>
            <TitleDescription
              title={strings.SETTINGS}
              description={strings.MY_ACCOUNT_DESC}
              style={{
                padding: 0,
                marginLeft: theme.spacing(4),
                marginBottom: theme.spacing(2),
              }}
            />
            {!isEditingAccount && (
              <Box display='flex' height='fit-content'>
                <Button
                  id='edit-account'
                  icon='iconEdit'
                  label={isMobile ? '' : strings.EDIT_ACCOUNT}
                  onClick={() => setIsEditingAccount(true)}
                  size='medium'
                  priority='primary'
                />
                <OptionsMenu
                  onOptionItemClick={onOptionItemClick}
                  optionItems={[{ label: strings.DELETE_ACCOUNT, value: 'delete-account', type: 'destructive' }]}
                />
              </Box>
            )}
          </Box>
        </PageHeaderWrapper>
        <Box ref={contentRef}>
          <Tabs activeTab={activeTab} onTabChange={onTabChangeHandler} tabs={tabs} />
        </Box>
      </Box>
    </Page>
  );
};

export default SettingsPage;
