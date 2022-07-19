import { createStyles, makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import React from 'react';
import { Notifications } from 'src/types/Notifications';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import Icon from '../common/icon/Icon';
import NotificationsDropdown from '../NotificationsDropdown';
import OrganizationsDropdown from '../OrganizationsDropdown';
import UserMenu from '../UserMenu';
import { ReactComponent as Logo } from '../common/Navbar/logo.svg';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme) =>
  createStyles({
    separator: {
      width: '1px',
      height: '32px',
      backgroundColor: theme.palette.gray[200],
      marginRight: '16px',
      marginLeft: '16px',
    },
    flex: {
      display: 'flex',
    },
  })
);

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

  return isDesktop ? (
    <>
      <NotificationsDropdown
        notifications={props.notifications}
        setNotifications={setNotifications}
        organizationId={selectedOrganization?.id}
        reloadOrganizationData={reloadOrganizationData}
      />
      <div className={classes.separator} />
      {organizations && organizations.length > 0 && (
        <>
          <OrganizationsDropdown
            organizations={organizations}
            selectedOrganization={selectedOrganization}
            setSelectedOrganization={setSelectedOrganization}
            reloadOrganizationData={reloadOrganizationData}
          />
          <div className={classes.separator} />
        </>
      )}
      <UserMenu user={user} reloadUser={reloadUser} hasOrganizations={organizations && organizations.length > 0} />
    </>
  ) : (
    <>
      <IconButton onClick={() => setShowNavBar(true)} size='small'>
        <Icon name='iconMenu' />
      </IconButton>
      <div className='logo'>
        <Logo />
      </div>

      <div className={classes.flex}>
        <NotificationsDropdown
          notifications={props.notifications}
          setNotifications={setNotifications}
          organizationId={selectedOrganization?.id}
          reloadOrganizationData={reloadOrganizationData}
        />
        <UserMenu user={user} reloadUser={reloadUser} hasOrganizations={organizations && organizations.length > 0} />
      </div>
    </>
  );
}
