import React from 'react';
import { useMixpanel } from 'react-mixpanel-browser';
import { useNavigate } from 'react-router-dom';

import { Box, Grid, IconButton, useTheme } from '@mui/material';
import { Svg } from '@terraware/web-components';

import AcceleratorBreadcrumbs from 'src/components/TopBar/AcceleratorBreadcrumbs';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useApplicationPortal from 'src/hooks/useApplicationPortal';
import { useOrganization, useUser } from 'src/providers/hooks';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import KnowledgeBaseLink from '../KnowledgeBaseLink';
import NotificationsDropdown from '../NotificationsDropdown';
import OrganizationsDropdown from '../OrganizationsDropdown';
import SmallDeviceUserMenu from '../SmallDeviceUserMenu';
import UserMenu from '../UserMenu';
import Icon from '../common/icon/Icon';

type TopBarProps = {
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TopBarContent(props: TopBarProps): JSX.Element | null {
  const navigate = useNavigate();
  const theme = useTheme();
  const { selectedOrganization, organizations, reloadOrganizations } = useOrganization();
  const { setShowNavBar } = props;
  const { isDesktop } = useDeviceInfo();
  const { user } = useUser();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { isApplicationPortal } = useApplicationPortal();
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
    window.location.href = `/sso/logout`;
  };

  const handleTopBarClick = () => {
    mixpanel?.track('TopBarHome');
    navigate(APP_PATHS.HOME);
  };

  return isDesktop ? (
    <>
      <Box sx={leftStyles}>
        <Box sx={logoStyles}>
          <Link onClick={() => handleTopBarClick()}>
            <Svg.Logo style={logoStyles} />
          </Link>
        </Box>

        {organizations && organizations.length > 0 && (
          <>
            <div style={separatorStyles} />
            {user && <AcceleratorBreadcrumbs />}
            {isApplicationPortal && (
              <>
                <p style={{ fontSize: '16px' }}>{selectedOrganization.name}</p>
              </>
            )}
            {!isAcceleratorRoute && !isApplicationPortal && <OrganizationsDropdown />}
          </>
        )}
      </Box>

      <Box sx={rightStyles}>
        <KnowledgeBaseLink />
        <NotificationsDropdown
          organizationId={selectedOrganization.id !== -1 ? selectedOrganization.id : undefined}
          reloadOrganizationData={reloadOrganizations}
        />
        <div style={separatorStyles} />
        <UserMenu hasOrganizations={organizations && organizations.length > 0} />
      </Box>
    </>
  ) : (
    <Grid
      container
      sx={{
        background: 'url(/assets/logo.svg) no-repeat center/37px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Grid item xs={3} sx={leftStyles}>
        {selectedOrganization.id !== -1 && (
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

      <Grid item xs={3} sx={rightStyles}>
        <KnowledgeBaseLink />
        <NotificationsDropdown
          organizationId={selectedOrganization.id !== -1 ? selectedOrganization.id : undefined}
          reloadOrganizationData={reloadOrganizations}
        />
        <SmallDeviceUserMenu onLogout={onHandleLogout} hasOrganizations={organizations && organizations.length > 0} />
      </Grid>
    </Grid>
  );
}
