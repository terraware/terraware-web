import {
  Box,
  Button,
  ClickAwayListener,
  Divider,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Slide,
  Typography,
  Theme,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import AddNewOrganizationModal from './AddNewOrganizationModal';
import Icon from './common/icon/Icon';
import useEnvironment from 'src/utils/useEnvironment';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    alignItems: 'center',
    backgroundColor: '#F1F0EC',
    borderRadius: '50%',
    color: theme.palette.TwClrTxt,
    display: 'flex',
    fontWeight: 500,
    height: '32px',
    justifyContent: 'center',
    width: '32px',
  },
  largeIcon: {
    width: '48px',
    height: '48px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginLeft: 'auto',
    height: 'fit-content',
  },
  closeIcon: {
    fill: theme.palette.TwClrIcnSecondary,
    width: '27px',
    height: '27px',
  },
  userMenuOpened: {
    '& .blurred': {
      backdropFilter: 'blur(8px)',
      background: 'rgba(249, 250, 250, 0.8)',
      height: '100%',
      alignItems: 'center',
      position: 'fixed',
      zIndex: 1300,
      inset: '0px',
    },
  },
  menuItem: {
    fontSize: '14px',
    padding: '16px 0',
    display: 'flex',
  },
  checkmarkIcon: {
    marginLeft: 'auto',
  },
  menuList: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  orgsList: {
    overflow: 'auto',
  },
  divider: {
    '&.MuiDivider-root': {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
  avatarButton: {
    minWidth: 'auto',
  },
}));

type SmallDeviceUserMenuProps = {
  organizations?: ServerOrganization[];
  selectedOrganization?: ServerOrganization;
  setSelectedOrganization: React.Dispatch<React.SetStateAction<ServerOrganization | undefined>>;
  reloadOrganizationData: (selectedOrgId?: number) => void;
  onLogout: () => void;
  user?: User;
  hasOrganizations?: boolean;
};
export default function SmallDeviceUserMenu({
  organizations,
  selectedOrganization,
  setSelectedOrganization,
  reloadOrganizationData,
  onLogout,
  user,
  hasOrganizations,
}: SmallDeviceUserMenuProps): JSX.Element | null {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const [newOrganizationModalOpened, setNewOrganizationModalOpened] = useState(false);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const { isProduction } = useEnvironment();
  const iconLetter = user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || user?.email?.charAt(0);

  const navigate = (url: string) => {
    history.push(url);
  };

  const handleToggle = () => {
    setOpen((pOpen) => !pOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const onCloseCreateOrganizationModal = () => {
    setNewOrganizationModalOpened(false);
  };

  const selectOrganization = (newlySelectedOrg: ServerOrganization) => {
    setSelectedOrganization((currentlySelectedOrg: ServerOrganization | undefined) => {
      if (newlySelectedOrg.id !== currentlySelectedOrg?.id) {
        history.push({ pathname: APP_PATHS.HOME });
      }
      return newlySelectedOrg;
    });
  };

  return (
    <div className={open ? classes.userMenuOpened : ''}>
      <AddNewOrganizationModal
        open={newOrganizationModalOpened}
        onCancel={onCloseCreateOrganizationModal}
        reloadOrganizationData={reloadOrganizationData}
      />
      <Button ref={anchorRef} id='composition-button' onClick={handleToggle} className={classes.avatarButton}>
        <div className={classes.icon}>{iconLetter}</div>
      </Button>
      <div className='blurred'>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement='top-end'
          transition
          sx={{ width: '300px', height: '100%', right: '0 !important', left: 'auto !important', zIndex: 1111 }}
        >
          <Slide direction='left' in={open} mountOnEnter unmountOnExit>
            <Paper sx={{ width: '300px', height: '100%' }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id='composition-menu'
                  aria-labelledby='composition-button'
                  sx={{ padding: '24px' }}
                  className={classes.menuList}
                >
                  <Box sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex' }}>
                      <div className={`${classes.icon} ${classes.largeIcon}`}>{iconLetter}</div>
                      <Typography sx={{ paddingLeft: '8px', color: theme.palette.TwClrTxt }}>
                        {user?.firstName} {user?.lastName}
                      </Typography>
                    </Box>
                    <button onClick={handleClose} className={classes.closeButton}>
                      <Icon name='close' className={classes.closeIcon} />
                    </button>
                  </Box>
                  <Divider sx={{ margin: '16px 0' }} />
                  {hasOrganizations ? (
                    <MenuItem
                      onClick={(e) => {
                        navigate(APP_PATHS.MY_ACCOUNT);
                        handleClose(e);
                      }}
                      className={classes.menuItem}
                    >
                      {strings.MY_ACCOUNT}
                    </MenuItem>
                  ) : null}
                  <MenuItem
                    onClick={(e) => {
                      onLogout();
                      handleClose(e);
                    }}
                    className={classes.menuItem}
                  >
                    {strings.LOG_OUT}
                  </MenuItem>
                  {hasOrganizations ? <Divider className={classes.divider} sx={{ margin: '16px 0' }} /> : null}
                  {hasOrganizations ? (
                    <div className={classes.orgsList}>
                      {organizations?.map((org, index) => {
                        return (
                          <MenuItem
                            onClick={(e) => {
                              selectOrganization(org);
                              handleClose(e);
                            }}
                            className={classes.menuItem}
                            key={`item-${index}`}
                          >
                            <Typography
                              sx={{ fontSize: '14px', fontWeight: selectedOrganization?.id === org.id ? 600 : 400 }}
                            >
                              {org.name}
                            </Typography>
                            {selectedOrganization?.id === org.id ? (
                              <Box className={classes.checkmarkIcon}>
                                <Icon name='checkmark' />
                              </Box>
                            ) : null}
                          </MenuItem>
                        );
                      })}
                    </div>
                  ) : null}
                  {hasOrganizations ? (
                    <>
                      <MenuItem className={classes.menuItem}> --- </MenuItem>
                      <MenuItem
                        onClick={(e) => {
                          handleClose(e);
                          setNewOrganizationModalOpened(true);
                        }}
                        className={classes.menuItem}
                      >
                        {strings.CREATE_NEW_ORGANIZATION}
                      </MenuItem>
                    </>
                  ) : null}
                  {!isProduction && hasOrganizations ? (
                    <>
                      <MenuItem className={classes.menuItem}> --- </MenuItem>
                      <MenuItem
                        onClick={(e) => {
                          navigate(APP_PATHS.OPT_IN);
                          handleClose(e);
                        }}
                        className={classes.menuItem}
                      >
                        {strings.OPT_IN}
                      </MenuItem>
                    </>
                  ) : null}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Slide>
        </Popper>
      </div>
    </div>
  );
}
