import { AppBar, IconButton, Link, Toolbar } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import HelpIcon from '@material-ui/icons/Help';
import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getOrganizations } from 'src/api/organization/organization';
import { SeedSearchCriteria } from 'src/api/seeds/search';
import { Notifications } from 'src/types/Notifications';
import { ServerOrganization } from 'src/types/Organization';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import NotificationsDropdown from './NotificationsDropdown';
import OrganizationsDropdown from './OrganizationsDropdown';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

const useStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      background: theme.palette.common.white,
      color: theme.palette.common.black,
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
  })
);

type TopBarProps = {
  notifications?: Notifications;
  setNotifications: (notifications?: Notifications) => void;
  setSeedSearchCriteria: (criteria: SeedSearchCriteria) => void;
  facilityId?: number;
  setOrganizations: (organizations: ServerOrganization[]) => void;
  organizations?: ServerOrganization[];
  setSelectedOrganization: (selectedOrganization: ServerOrganization) => void;
  selectedOrganization?: ServerOrganization;
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
  } = props;
  const location = useStateLocation();

  useEffect(() => {
    const populateOrganizations = async () => {
      const response = await getOrganizations();
      if (response.requestSucceeded) {
        setOrganizations(response.organizations);
      } else {
        setOrganizationError(true);
      }
    };
    populateOrganizations();
  }, [location, setOrganizationError, setOrganizations]);

  useEffect(() => {
    if (organizations) {
      if (!selectedOrganization) {
        setSelectedOrganization(organizations[0]);
      } else {
        // update selectedOrganization
        const previousSelectedOrganization = organizations?.find((org) => org.id === selectedOrganization.id);
        if (previousSelectedOrganization) {
          setSelectedOrganization(previousSelectedOrganization);
        }
      }
    }
  }, [organizations, selectedOrganization, setSelectedOrganization]);

  return (
    <AppBar position='static' className={classes.appBar}>
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
              <HelpIcon />
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
          />
          <div className={classes.separator} />
          <UserMenu />
        </div>
      </Toolbar>
    </AppBar>
  );
}
