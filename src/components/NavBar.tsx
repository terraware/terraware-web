import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Link as RouterLink, useRouteMatch } from 'react-router-dom';
import { useResetRecoilState } from 'recoil';
import sessionSelector from '../state/selectors/session';

const useStyles = makeStyles((theme) =>
  createStyles({
    icon: {
      margin: `20px auto`,
      width: '68px',
    },
    appBar: {
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
    menu: {
      width: '160px',
    },
    selected: {
      borderLeft: `2px solid ${theme.palette.blue[600]}`,
      color: theme.palette.blue[600],
    },
  })
);

export default function NavBar(): JSX.Element | null {
  const classes = useStyles();

  const isDashboardRoute = useRouteMatch('/dashboard/');
  const isSpeciesRoute = useRouteMatch('/species/');
  const resetSession = useResetRecoilState(sessionSelector);

  const logout = () => {
    resetSession();
  };

  return (
    <Drawer variant='permanent' open={true} classes={{ paper: classes.menu }}>
      <div className={classes.icon} id='tf-icon'>
        <img src='/assets/logo.svg' alt='logo' width='60px' />
      </div>
      <Divider />
      <List>
        <div>
          <ListItem
            button
            component={RouterLink}
            className={isDashboardRoute ? classes.selected : ''}
            to='/dashboard'
            id='dashboard'
          >
            <ListItemText primary='Dashboard' />
          </ListItem>
          <ListItem
            button
            component={RouterLink}
            className={isSpeciesRoute ? classes.selected : ''}
            to='/species'
            id='species'
          >
            <ListItemText primary='Species' />
          </ListItem>

          <ListItem button id='logout' onClick={logout}>
            <ListItemText primary='Logout' />
          </ListItem>
        </div>
      </List>
    </Drawer>
  );
}
