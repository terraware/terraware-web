import React, { type JSX, useMemo, useState } from 'react';
import { useEffect, useRef } from 'react';

import {
  Box,
  Button,
  ButtonBase,
  ClickAwayListener,
  Divider,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Slide,
  Typography,
  useTheme,
} from '@mui/material';

import { APP_PATHS } from 'src/constants';
import { useDocLinks } from 'src/docLinks';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useUser } from 'src/providers';
import { useOrganization } from 'src/providers/hooks';
import strings from 'src/strings';
import { Organization } from 'src/types/Organization';
import { getRgbaFromHex } from 'src/utils/color';
import useEnvironment from 'src/utils/useEnvironment';

import AddNewOrganizationModal from './AddNewOrganizationModal';
import Icon from './common/icon/Icon';

type SmallDeviceUserMenuProps = {
  onLogout: () => void;
  hasOrganizations?: boolean;
};
export default function SmallDeviceUserMenu({
  onLogout,
  hasOrganizations,
}: SmallDeviceUserMenuProps): JSX.Element | null {
  const { selectedOrganization, setSelectedOrganization, organizations, redirectAndNotify, reloadOrganizations } =
    useOrganization();
  const { user } = useUser();
  const docLinks = useDocLinks();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const [newOrganizationModalOpened, setNewOrganizationModalOpened] = useState(false);
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const { isProduction } = useEnvironment();
  const iconLetter = user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || user?.email?.charAt(0);

  const iconStyles = {
    alignItems: 'center',
    backgroundColor: '#F1F0EC',
    borderRadius: '50%',
    color: theme.palette.TwClrTxt,
    display: 'flex',
    fontWeight: 500,
    height: '32px',
    justifyContent: 'center',
    width: '32px',
  };

  const menuItemStyles = {
    fontSize: '14px',
    padding: '16px 16px',
    display: 'flex',
    fontWeight: 500,
    borderRadius: '16px',
  };

  const isFunder = useMemo(() => user?.userType === 'Funder', [user]);

  const navigateTo = (url: string) => {
    navigate(url);
  };

  const handleToggle = () => {
    setOpen((pOpen) => !pOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    } else {
      event.preventDefault();
      setOpen(false);
    }
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
        navigate({ pathname: APP_PATHS.HOME, search: `organizationId=${newlySelectedOrg.id}` });
      }
      return newlySelectedOrg;
    });
  };

  return (
    <Box
      sx={[
        open && {
          '& .blurred': {
            backdropFilter: 'blur(8px)',
            background: getRgbaFromHex(theme.palette.TwClrBgSecondary as string, 0.8),
            height: '100%',
            alignItems: 'center',
            position: 'fixed',
            zIndex: 1300,
            inset: '0px',
            overflowY: 'scroll',
          },
        },
      ]}
    >
      <AddNewOrganizationModal
        open={newOrganizationModalOpened}
        onCancel={onCloseCreateOrganizationModal}
        onSuccess={(organization: Organization) => {
          void reloadOrganizations();
          redirectAndNotify(organization);
        }}
      />
      <Button ref={anchorRef} id='composition-button' onClick={handleToggle} sx={{ minWidth: 'auto' }}>
        <Box sx={iconStyles}>{iconLetter}</Box>
      </Button>
      <div className='blurred'>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement='top-end'
          disablePortal={true}
          transition
          sx={{ width: '300px', height: '100%', right: '0 !important', left: 'auto !important', zIndex: 1111 }}
        >
          <Slide direction='left' in={open} mountOnEnter unmountOnExit>
            <Paper sx={{ width: '300px', height: 'auto', boxShadow: 'none' }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id='composition-menu'
                  aria-labelledby='composition-button'
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px',
                    maxHeight: '100vh',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  <Box sx={{ display: 'flex' }}>
                    <ButtonBase
                      onClick={handleClose}
                      sx={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        marginLeft: 'auto',
                        height: 'auto',
                        paddingBottom: '16px',
                      }}
                    >
                      <Icon name='close' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
                    </ButtonBase>
                  </Box>
                  <Typography
                    sx={{
                      paddingLeft: '16px',
                      paddingBottom: '12px',
                      color: theme.palette.TwClrTxt,
                      fontSize: '12px',
                      fontWeight: 400,
                    }}
                  >
                    {strings.ACCOUNT.toUpperCase()}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '16px',
                      paddingTop: '8px',
                      paddingBottom: '12px',
                    }}
                  >
                    <Box sx={[iconStyles, { width: '40px', height: '40px' }]}>{iconLetter}</Box>
                    <div>
                      <Typography sx={{ height: '24px', paddingLeft: '8px', color: theme.palette.TwClrTxt }}>
                        {user?.firstName} {user?.lastName}
                      </Typography>
                      <Typography
                        sx={{
                          paddingLeft: '8px',
                          paddingTop: '4px',
                          fontSize: '12px',
                          fontWeight: 400,
                          color: theme.palette.TwClrTxt,
                        }}
                      >
                        {user?.email}
                      </Typography>
                    </div>
                  </Box>
                  {!isFunder && (
                    <MenuItem
                      onClick={(e) => {
                        navigateTo(APP_PATHS.MY_ACCOUNT);
                        handleClose(e);
                      }}
                      sx={menuItemStyles}
                    >
                      {strings.MY_ACCOUNT}
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={(e) => {
                      window.open(docLinks.privacy_policy, '_blank');
                      handleClose(e);
                    }}
                    sx={menuItemStyles}
                  >
                    {strings.PRIVACY_POLICY}
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => {
                      navigateTo(APP_PATHS.HELP_SUPPORT);
                      handleClose(e);
                    }}
                    sx={menuItemStyles}
                  >
                    {strings.HELP_SUPPORT}
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => {
                      onLogout();
                      handleClose(e);
                    }}
                    sx={menuItemStyles}
                  >
                    {strings.LOG_OUT}
                  </MenuItem>

                  {!isFunder && (
                    <>
                      <Divider
                        sx={{
                          background: theme.palette.TwClrBrdrTertiary,
                          '&.MuiDivider-root': {
                            margin: theme.spacing(1, 2, 1, 2),
                          },
                          margin: '16px 0',
                        }}
                      />
                      <Typography
                        sx={{
                          paddingLeft: '16px',
                          paddingBottom: '12px',
                          paddingTop: '12px',
                          color: theme.palette.TwClrTxt,
                          fontSize: '12px',
                          fontWeight: 400,
                        }}
                      >
                        {strings.ORGANIZATIONS.toUpperCase()}
                      </Typography>
                      {hasOrganizations ? (
                        <div>
                          {organizations?.map((org, index) => {
                            return (
                              <MenuItem
                                onClick={(e) => {
                                  selectOrganization(org);
                                  handleClose(e);
                                }}
                                key={`item-${index}`}
                                sx={[
                                  menuItemStyles,
                                  selectedOrganization?.id === org.id && {
                                    backgroundColor: theme.palette.TwClrBgGhostActive,
                                  },
                                ]}
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
                        sx={menuItemStyles}
                      >
                        <Icon name='plus' />
                        <div style={{ paddingLeft: '8px' }}>{strings.CREATE_NEW_ORGANIZATION}</div>
                      </MenuItem>
                    </>
                  )}
                  {!isProduction && hasOrganizations ? (
                    <div>
                      <MenuItem
                        onClick={(e) => {
                          navigateTo(APP_PATHS.OPT_IN);
                          handleClose(e);
                        }}
                        sx={menuItemStyles}
                      >
                        {strings.OPT_IN}
                      </MenuItem>
                    </div>
                  ) : null}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Slide>
        </Popper>
      </div>
    </Box>
  );
}
