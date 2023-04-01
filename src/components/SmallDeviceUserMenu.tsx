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
import hexRgb from 'hex-rgb';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Organization } from 'src/types/Organization';
import AddNewOrganizationModal from './AddNewOrganizationModal';
import Icon from './common/icon/Icon';
import useEnvironment from 'src/utils/useEnvironment';
import { useUser } from 'src/providers';
import { useOrganization } from 'src/providers/hooks';

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
  },
  userMenuOpened: {
    '& .blurred': {
      backdropFilter: 'blur(8px)',
      background: hexRgb(`${theme.palette.TwClrBgSecondary}`, { alpha: 0.8, format: 'css' }),
      height: '100%',
      alignItems: 'center',
      position: 'fixed',
      zIndex: 1300,
      inset: '0px',
    },
  },
  menuItem: {
    fontSize: '14px',
    padding: '16px 16px',
    display: 'flex',
    fontWeight: 500,
    borderRadius: '16px',
  },
  menuItemSelected: {
    backgroundColor: theme.palette.TwClrBgGhostActive,
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
  onLogout: () => void;
  hasOrganizations?: boolean;
};
export default function SmallDeviceUserMenu({
  onLogout,
  hasOrganizations,
}: SmallDeviceUserMenuProps): JSX.Element | null {
  const { selectedOrganization, setSelectedOrganization, organizations } = useOrganization();
  const { user } = useUser();
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

  const selectOrganization = (newlySelectedOrg: Organization) => {
    setSelectedOrganization((currentlySelectedOrg: Organization | undefined) => {
      if (newlySelectedOrg.id !== currentlySelectedOrg?.id) {
        history.push({ pathname: APP_PATHS.HOME });
      }
      return newlySelectedOrg;
    });
  };

  return (
    <div className={open ? classes.userMenuOpened : ''}>
      <AddNewOrganizationModal open={newOrganizationModalOpened} onCancel={onCloseCreateOrganizationModal} />
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
                    <button onClick={handleClose} className={classes.closeButton}>
                      <Icon name='close' size='medium' className={classes.closeIcon} />
                    </button>
                  </Box>
                  <Typography sx={{ paddingLeft: '16px', paddingBottom: '16px', color: theme.palette.TwClrTxt, fontSize: '12px', fontWeight: 400 }}>
                        {strings.ACCOUNT.toUpperCase()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', paddingLeft: '16px' }}>
                      <div className={`${classes.icon} ${classes.largeIcon}`}>{iconLetter}</div>
                      <div>
                        <Typography sx={{ paddingLeft: '8px', color: theme.palette.TwClrTxt }}>
                          {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography sx={{ paddingLeft: '8px', fontSize: '12px', fontWeight: 400, color: theme.palette.TwClrTxt }}>
                          {user?.email}
                        </Typography>
                      </div>
                  </Box>
                  <MenuItem
                    onClick={(e) => {
                      navigate(APP_PATHS.MY_ACCOUNT);
                      handleClose(e);
                    }}
                    className={classes.menuItem}
                  >
                    {strings.MY_ACCOUNT}
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => {
                      onLogout();
                      handleClose(e);
                    }}
                    className={classes.menuItem}
                  >
                    {strings.LOG_OUT}
                  </MenuItem>
                  <Divider className={classes.divider} sx={{ margin: '16px 0' }} />
                  <Typography sx={{ paddingLeft: '16px', paddingBottom: '16px', color: theme.palette.TwClrTxt, fontSize: '12px', fontWeight: 400 }}>
                        {strings.ORGANIZATIONS.toUpperCase()}
                  </Typography>
                  {hasOrganizations ? (
                    <div className={classes.orgsList}>
                      {organizations?.map((org, index) => {
                        return (
                          <MenuItem
                            onClick={(e) => {
                              selectOrganization(org);
                              handleClose(e);
                            }}
                            className={selectedOrganization.id === org.id ? (`${classes.menuItem} ${classes.menuItemSelected}`) : classes.menuItem}
                            key={`item-${index}`}
                          >
                            {org.name}
                          </MenuItem>
                        );
                      })}
                    </div>
                  ) : null}
                  <MenuItem
                    onClick={(e) => {
                      handleClose(e);
                      setNewOrganizationModalOpened(true);
                    }}
                    className={classes.menuItem}
                  >
                    <Icon name='plus'/>&nbsp;{strings.CREATE_NEW_ORGANIZATION}
                  </MenuItem>
                  {!isProduction && hasOrganizations ? (
                    <>
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
