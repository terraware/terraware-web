import React, { type JSX } from 'react';
import { useMixpanel } from 'react-mixpanel-browser';

import { Box, Grid, IconButton, useTheme } from '@mui/material';
import { Svg } from '@terraware/web-components';

import KnowledgeBaseLink from 'src/components/KnowledgeBaseLink';
import NotificationsDropdown from 'src/components/NotificationsDropdown';
import OrganizationsDropdown from 'src/components/OrganizationsDropdown';
import SettingsLink from 'src/components/SettingsLink';
import SmallDeviceUserMenu from 'src/components/SmallDeviceUserMenu';
import AcceleratorBreadcrumbs from 'src/components/TopBar/AcceleratorBreadcrumbs';
import UserMenu from 'src/components/UserMenu';
import Link from 'src/components/common/Link';
import Icon from 'src/components/common/icon/Icon';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useApplicationPortal from 'src/hooks/useApplicationPortal';
import useFunderPortal from 'src/hooks/useFunderPortal';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useOrganization, useUser, useUserFundingEntity } from 'src/providers/hooks';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import FunderBreadcrumbs from './FunderBreadcrumbs';

type TopBarProps = {
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TopBarContent(props: TopBarProps): JSX.Element | null {
  const navigate = useSyncNavigate();
  const theme = useTheme();
  const { selectedOrganization, organizations, reloadOrganizations } = useOrganization();
  const { userFundingEntity } = useUserFundingEntity();
  const { setShowNavBar } = props;
  const { isDesktop } = useDeviceInfo();
  const { user } = useUser();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { isApplicationPortal } = useApplicationPortal();
  const { isFunderRoute } = useFunderPortal();
  const mixpanel = useMixpanel();

  const logoStyles = {
    width: 137,
  };

  const separatorStyles = {
    width: '1px',
    height: '32px',
    backgroundColor: theme.palette.TwClrBrdrTertiary,
    marginRight: '16px',
    marginLeft: '16px',
  };

  const leftStyles = {
    display: 'flex',
    justifyContent: 'left',
    alignItems: 'center',
  };

  const rightStyles = {
    display: 'flex',
    justifyContent: 'right',
    alignItems: 'center',
  };

  const onHandleLogout = () => {
    mixpanel?.reset();
    window.location.href = '/sso/logout';
  };

  const handleTopBarClick = () => {
    mixpanel?.track(MIXPANEL_EVENTS.TOP_BAR_HOME);
    navigate(APP_PATHS.HOME);
  };

  return isDesktop ? (
    <>
      <Box sx={leftStyles}>
        <Box sx={logoStyles}>
          <Link onClick={() => handleTopBarClick()}>
            <Svg.TerrawareLogoDesktop style={logoStyles} />
          </Link>
        </Box>

        <div style={separatorStyles} />
        {user && <AcceleratorBreadcrumbs />}
        {user && <FunderBreadcrumbs />}
        {organizations && organizations.length > 0 && (
          <>
            {isApplicationPortal && (
              <>
                <p style={{ fontSize: '16px' }}>{selectedOrganization?.name}</p>
              </>
            )}
            {!isAcceleratorRoute && !isApplicationPortal && !isFunderRoute && <OrganizationsDropdown />}
          </>
        )}
        {userFundingEntity && (
          <>
            <span style={{ fontSize: '16px' }}>{userFundingEntity.name}</span>
          </>
        )}
      </Box>

      <Box sx={rightStyles}>
        <KnowledgeBaseLink />
        <NotificationsDropdown organizationId={selectedOrganization?.id} reloadOrganizationData={reloadOrganizations} />
        {userFundingEntity && <SettingsLink />}
        <div style={separatorStyles} />
        <UserMenu />
      </Box>
    </>
  ) : (
    <Grid
      container
      sx={{
        background:
          isFunderRoute || user?.userType === 'Funder'
            ? 'url(/assets/funder-logo-mobile.svg) no-repeat 0/145px'
            : 'url(/assets/terraware-logo-mobile.svg) no-repeat 32px/105px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Grid item xs={1} sx={leftStyles}>
        {selectedOrganization && (
          <IconButton onClick={() => setShowNavBar(true)} size='small'>
            <Icon name='iconMenu' />
          </IconButton>
        )}
      </Grid>

      <Grid
        item
        xs={6}
        onClick={() => navigate(APP_PATHS.HOME)}
        sx={{
          cursor: 'pointer',
          display: 'flex',
          height: '24px',
          justifyContent: 'center',
          ...logoStyles,
        }}
      />

      <Grid item xs={5} sx={rightStyles}>
        <KnowledgeBaseLink />
        <NotificationsDropdown organizationId={selectedOrganization?.id} reloadOrganizationData={reloadOrganizations} />
        {userFundingEntity && <SettingsLink />}
        <SmallDeviceUserMenu onLogout={onHandleLogout} hasOrganizations={organizations && organizations.length > 0} />
      </Grid>
    </Grid>
  );
}
