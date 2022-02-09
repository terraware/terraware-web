import { AppBar, IconButton, Link, Toolbar } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { SeedSearchCriteria } from 'src/api/seeds/search';
import { Notifications } from 'src/types/Notifications';
import { ServerOrganization } from 'src/types/Organization';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import Icon from './common/icon/Icon';
import NotificationsDropdown from './NotificationsDropdown';
import OrganizationsDropdown from './OrganizationsDropdown';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

const useStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      background: theme.palette.common.white,
      color: theme.palette.common.black,
      filter: 'drop-shadow(0 0 12px rgba(0, 0, 0, 0.5))',
      boxShadow: 'none',
    },
    icon: {
      padding: theme.spacing(1, 1),
      width: '68px',
    },
    appBar2: {
      backgroundColor: theme.palette.common.white,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    grow: {
      flexGrow: 1,
    },
    flex: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    right: {
      marginLeft: 'auto',
    },
    separator: {
      width: '1px',
      height: '32px',
      backgroundColor: theme.palette.gray[200],
      marginTop: '8px',
      marginRight: '16px',
      marginLeft: '16px',
    },
    helpIcon: {
      fill: '#708284',
    },
  })
);

type TopBarProps = {
  notifications?: Notifications;
  setNotifications: (notifications?: Notifications) => void;
  setSeedSearchCriteria: (criteria: SeedSearchCriteria) => void;
  facilityId?: number;
  organizations?: ServerOrganization[];
  setSelectedOrganization: (selectedOrganization: ServerOrganization) => void;
  selectedOrganization?: ServerOrganization;
  reloadOrganizationData: () => void;
};

export default function TopBar(props: TopBarProps): JSX.Element | null {
  const classes = useStyles();
  const {
    notifications,
    setNotifications,
    setSeedSearchCriteria,
    facilityId,
    setSelectedOrganization,
    selectedOrganization,
    organizations,
    reloadOrganizationData,
  } = props;
  const location = useStateLocation();

  return (
    <AppBar position='fixed' className={classes.appBar}>
      <Toolbar className={classes.right}>
        <div className={classes.flex}>
          <SearchBar facilityId={facilityId || 0} />
          <Link
            id='help-button-link'
            component={RouterLink}
            to={getLocation('/help', location)}
            target='_blank'
            rel='noopener noreferrer'
          >
            <IconButton id='help-button' onClick={() => true}>
              <Icon name='help' className={classes.helpIcon} />
            </IconButton>
          </Link>
          <NotificationsDropdown
            notifications={notifications}
            setNotifications={setNotifications}
            setSeedSearchCriteria={setSeedSearchCriteria}
            currFacilityId={facilityId || 0}
          />
          <div className={classes.separator} />
          <OrganizationsDropdown
            organizations={organizations}
            selectedOrganization={selectedOrganization}
            setSelectedOrganization={setSelectedOrganization}
            reloadOrganizationData={reloadOrganizationData}
          />
          <div className={classes.separator} />
          <UserMenu />
        </div>
      </Toolbar>
    </AppBar>
  );
}
