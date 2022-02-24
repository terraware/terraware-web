import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { SeedSearchCriteria } from 'src/api/seeds/search';
import { Notifications } from 'src/types/Notifications';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import NotificationsDropdown from '../NotificationsDropdown';
import OrganizationsDropdown from '../OrganizationsDropdown';
import UserMenu from '../UserMenu';

const useStyles = makeStyles((theme) =>
  createStyles({
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
  organizations?: ServerOrganization[];
  setSelectedOrganization: React.Dispatch<React.SetStateAction<ServerOrganization | undefined>>;
  selectedOrganization?: ServerOrganization;
  reloadOrganizationData: () => void;
  user?: User;
  reloadUser: () => void;
};

export default function TopBarContent(props: TopBarProps): JSX.Element | null {
  const classes = useStyles();
  const {
    setNotifications,
    setSeedSearchCriteria,
    facilityId,
    setSelectedOrganization,
    selectedOrganization,
    organizations,
    reloadOrganizationData,
    user,
    reloadUser,
  } = props;

  return (
    <>
      <NotificationsDropdown
        notifications={props.notifications}
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
      <UserMenu user={user} reloadUser={reloadUser} />
    </>
  );
}
