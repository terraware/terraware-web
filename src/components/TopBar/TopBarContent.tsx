import { IconButton, Theme, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Svg } from '@terraware/web-components';
import React from 'react';

import { Notifications } from 'src/types/Notifications';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import Icon from '../common/icon/Icon';
import NotificationsDropdown from '../NotificationsDropdown';
import OrganizationsDropdown from '../OrganizationsDropdown';
import UserMenu from '../UserMenu';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import SmallDeviceUserMenu from '../SmallDeviceUserMenu';

const useStyles = makeStyles((theme: Theme) => ({
  logo: {
    width: 137,
  },
  separator: {
    width: '1px',
    height: '32px',
    backgroundColor: theme.palette.gray[200],
    marginRight: '16px',
    marginLeft: '16px',
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
  },
  left: {
    display: 'flex',
    justifyContent: 'left',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
  },
  right: {
    display: 'flex',
    justifyContent: 'right',
    alignItems: 'center',
  },
}));

type TopBarProps = {
  notifications?: Notifications;
  setNotifications: (notifications?: Notifications) => void;
  organizations?: ServerOrganization[];
  setSelectedOrganization: React.Dispatch<React.SetStateAction<ServerOrganization | undefined>>;
  selectedOrganization?: ServerOrganization;
  reloadOrganizationData: (selectedOrgId?: number) => void;
  user?: User;
  reloadUser: () => void;
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TopBarContent(props: TopBarProps): JSX.Element | null {
  const classes = useStyles();
  const {
    setNotifications,
    setSelectedOrganization,
    selectedOrganization,
    organizations,
    reloadOrganizationData,
    user,
    reloadUser,
    setShowNavBar,
  } = props;
  const { isDesktop } = useDeviceInfo();

  const onHandleLogout = () => {
    window.location.href = `/sso/logout`;
  };

  return isDesktop ? (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: 'auto' }}>
        {organizations && organizations.length > 0 && (
          <>
            <div className={classes.separator} />
            <OrganizationsDropdown
              organizations={organizations}
              selectedOrganization={selectedOrganization}
              setSelectedOrganization={setSelectedOrganization}
              reloadOrganizationData={reloadOrganizationData}
            />
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
        <NotificationsDropdown
          notifications={props.notifications}
          setNotifications={setNotifications}
          organizationId={selectedOrganization?.id}
          reloadOrganizationData={reloadOrganizationData}
        />
        <div className={classes.separator} />
        <UserMenu user={user} reloadUser={reloadUser} hasOrganizations={organizations && organizations.length > 0} />
      </div>
    </>
  ) : (
    <Grid container className={classes.flex}>
      <Grid item xs={3} className={classes.left}>
        {selectedOrganization && (
          <IconButton onClick={() => setShowNavBar(true)} size='small'>
            <Icon name='iconMenu' />
          </IconButton>
        )}
      </Grid>

      <Grid item xs={6} className={`${classes.center} logo`}>
        <Svg.Logo className={classes.logo} />
      </Grid>

      <Grid item xs={3} className={classes.right}>
        <NotificationsDropdown
          notifications={props.notifications}
          setNotifications={setNotifications}
          organizationId={selectedOrganization?.id}
          reloadOrganizationData={reloadOrganizationData}
        />
        <SmallDeviceUserMenu
          onLogout={onHandleLogout}
          user={user}
          organizations={organizations}
          selectedOrganization={selectedOrganization}
          setSelectedOrganization={setSelectedOrganization}
          reloadOrganizationData={reloadOrganizationData}
          hasOrganizations={organizations && organizations.length > 0}
        />
      </Grid>
    </Grid>
  );
}
