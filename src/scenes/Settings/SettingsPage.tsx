import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';

import { Box, useTheme } from '@mui/material';
import { Button, DropdownItem, Tabs } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import FundersTable from 'src/components/FundersTable';
import Page from 'src/components/Page';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TitleDescription from 'src/components/common/TitleDescription';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization, useUser, useUserFundingEntity } from 'src/providers';
import MyAccountForm from 'src/scenes/MyAccountRouter/MyAccountForm';
import useStickyTabs from 'src/utils/useStickyTabs';

const SettingsPage = () => {
  const { activeLocale, strings } = useLocalization();
  const mixpanel = useMixpanel();
  const theme = useTheme();
  const { user, reloadUser } = useUser();
  const { userFundingEntity } = useUserFundingEntity();
  const { isMobile } = useDeviceInfo();

  const contentRef = useRef(null);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onTabsDeleteCancel = useCallback(() => setIsDeleteModalOpen(false), []);

  const tabsBackToView = useCallback(() => setIsEditingAccount(false), []);

  const onClickEditAccount = useCallback(() => setIsEditingAccount(true), []);

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
            onDeleteCancel={onTabsDeleteCancel}
            backToView={tabsBackToView}
            user={{ ...user }}
            reloadUser={reloadUser}
            desktopOffset={'56px'}
          />
        ),
      },
      ...(userFundingEntity?.id
        ? [
            {
              id: 'user-access',
              label: strings.USER_ACCESS,
              children: <FundersTable fundingEntityId={userFundingEntity?.id} />,
            },
          ]
        : []),
    ];
  }, [
    activeLocale,
    user,
    strings.MY_ACCOUNT,
    strings.USER_ACCESS,
    isEditingAccount,
    isDeleteModalOpen,
    onTabsDeleteCancel,
    tabsBackToView,
    reloadUser,
    userFundingEntity?.id,
  ]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'my-account',
    tabs,
    viewIdentifier: 'settings',
  });

  const onChangeTabHandler = useCallback(
    (tab: string) => {
      if (tab !== 'my-account') {
        mixpanel?.track(MIXPANEL_EVENTS.SETTINGS_TAB, {
          tab,
        });
      }
      setIsEditingAccount(false);
      onChangeTab(tab);
    },
    [mixpanel, onChangeTab]
  );

  const onOptionItemClick = useCallback((optionItem: DropdownItem) => {
    if (optionItem.value === 'delete-account') {
      setIsDeleteModalOpen(true);
    }
  }, []);

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
            {!isEditingAccount && activeTab === 'my-account' && (
              <Box display='flex' height='fit-content'>
                <Button
                  id='edit-account'
                  icon='iconEdit'
                  label={isMobile ? '' : strings.EDIT_ACCOUNT}
                  onClick={onClickEditAccount}
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
          <Tabs activeTab={activeTab} onChangeTab={onChangeTabHandler} tabs={tabs} />
        </Box>
      </Box>
    </Page>
  );
};

export default SettingsPage;
