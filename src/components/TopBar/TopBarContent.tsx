import React from 'react';
import { useHistory } from 'react-router-dom';
import { IconButton, Theme, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Svg } from '@terraware/web-components';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import Icon from '../common/icon/Icon';
import NotificationsDropdown from '../NotificationsDropdown';
import OrganizationsDropdown from '../OrganizationsDropdown';
import UserMenu from '../UserMenu';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import SmallDeviceUserMenu from '../SmallDeviceUserMenu';
import { useOrganization, useUser } from 'src/providers/hooks';
import Link from 'src/components/common/Link';
import AcceleratorBreadcrumbs from 'src/components/TopBar/AcceleratorBreadcrumbs';
import { APP_PATHS } from 'src/constants';

const useStyles = makeStyles((theme: Theme) => ({
  logo: {
    width: 137,
  },
  backgroundLogo: {
    background: 'url(/assets/logo.svg) no-repeat center/37px',
  },
  separator: {
    width: '1px',
    height: '32px',
    backgroundColor: theme.palette.TwClrBaseGray300,
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
    alignItems: 'center',
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
  clickableLogo: {
    cursor: 'pointer',
    height: '24px',
  },
}));

type TopBarProps = {
  setShowNavBar: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TopBarContent(props: TopBarProps): JSX.Element | null {
  const history = useHistory();
  const classes = useStyles();
  const { selectedOrganization, organizations, reloadOrganizations } = useOrganization();
  const { setShowNavBar } = props;
  const { isDesktop } = useDeviceInfo();
  const { user } = useUser();
  const { isAcceleratorRoute, featureFlagAccelerator } = useAcceleratorConsole();

  const onHandleLogout = () => {
    window.location.href = `/sso/logout`;
  };

  return isDesktop ? (
    <>
      <div className={classes.left}>
        <div className='logo'>
          <Link to={APP_PATHS.HOME}>
            <Svg.Logo className={classes.logo} />
          </Link>
        </div>

        {organizations && organizations.length > 0 && (
          <>
            <div className={classes.separator} />
            {isAcceleratorRoute && featureFlagAccelerator && user && <AcceleratorBreadcrumbs />}
            {!isAcceleratorRoute && <OrganizationsDropdown />}
          </>
        )}
      </div>

      <div className={classes.right}>
        <NotificationsDropdown
          organizationId={selectedOrganization.id !== -1 ? selectedOrganization.id : undefined}
          reloadOrganizationData={reloadOrganizations}
        />
        <div className={classes.separator} />
        <UserMenu hasOrganizations={organizations && organizations.length > 0} />
      </div>
    </>
  ) : (
    <Grid container className={`${classes.flex}  ${classes.backgroundLogo}`}>
      <Grid item xs={3} className={classes.left}>
        {selectedOrganization.id !== -1 && (
          <IconButton onClick={() => setShowNavBar(true)} size='small'>
            <Icon name='iconMenu' />
          </IconButton>
        )}
      </Grid>

      <Grid
        item
        xs={6}
        className={`${classes.center} ${classes.clickableLogo} logo`}
        onClick={() => history.push(APP_PATHS.HOME)}
      />

      <Grid item xs={3} className={classes.right}>
        <NotificationsDropdown
          organizationId={selectedOrganization.id !== -1 ? selectedOrganization.id : undefined}
          reloadOrganizationData={reloadOrganizations}
        />
        <SmallDeviceUserMenu onLogout={onHandleLogout} hasOrganizations={organizations && organizations.length > 0} />
      </Grid>
    </Grid>
  );
}
