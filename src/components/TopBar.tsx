import { AppBar, Grid, IconButton, Link, Toolbar } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import HelpIcon from '@material-ui/icons/Help';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import strings from 'src/strings';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import ErrorBoundary from '../ErrorBoundary';
import Dropdown from './common/Dropdown';
import NotificationsDropdown from './NotificationsDropdown';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';
import { Project } from '../types/Organization';

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

export default function TopBar(): JSX.Element | null {
  const classes = useStyles();
  const location = useStateLocation();

  return (
    <AppBar position='static' className={classes.appBar}>
      <Toolbar className={classes.right}>
        <div className={classes.flex}>
          <SearchBar />
          <Link
            id='help-button-link'
            component={RouterLink}
            to={getLocation('/help', location)}
            target='_blank'
            rel='noopener noreferrer'>
            <IconButton id='help-button' onClick={() => true}>
              <HelpIcon />
            </IconButton>
          </Link>
          <NotificationsDropdown />
          <div className={classes.separator} />
          <UserMenu />
        </div>
      </Toolbar>
    </AppBar>
  );
}