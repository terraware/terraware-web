import { IconButton, Link } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Chip from '@material-ui/core/Chip';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import AddIcon from '@material-ui/icons/Add';
import HelpIcon from '@material-ui/icons/Help';
import React from 'react';
import { Link as RouterLink, useRouteMatch } from 'react-router-dom';
import strings from '../../strings';
import useStateLocation, { getLocation } from '../../utils/useStateLocation';
import NotificationsDropdown from '../NotificationsDropdown';
import SearchBar from '../SearchBar';

const useStyles = makeStyles((theme) =>
  createStyles({
    icon: {
      padding: theme.spacing(1, 1),
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
    addAccession: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    flex: {
      display: 'flex',
    },
  })
);
const newAccessionChipStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.common.white,
  },
}));

export default function NavBar(): JSX.Element | null {
  const location = useStateLocation();
  const isDatabaseRoute = useRouteMatch('/accessions/');
  const isSpeciesRoute = useRouteMatch('/species/');
  const isHelpRoute = useRouteMatch('/help/');
  const classes = useStyles();
  const getTabIndex = () => {
    if (isDatabaseRoute) {
      return 1;
    }
    if (isSpeciesRoute) {
      return 2;
    }

    return 0;
  };
  const [tabIndex, setTabIndex] = React.useState(0);

  React.useEffect(() => {
    setTabIndex(getTabIndex());
  }, [location]);

  const handleTabChange = (event: React.ChangeEvent<any>, newValue: number) => {
    setTabIndex(newValue);
  };

  const fullBar = !isHelpRoute;

  return (
    <AppBar position='static' className={classes.appBar} elevation={1}>
      <Toolbar className={classes.grow}>
        <div className={classes.grow} />
        {fullBar && (
          <div className={classes.flex}>
            <SearchBar />
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
            <NotificationsDropdown />
            <Link
              component={RouterLink}
              to={getLocation('/accessions/new', location)}
            >
              <Chip
                id='newAccession'
                className={classes.addAccession}
                label={strings.NEW_ACCESSION}
                clickable={true}
                deleteIcon={<AddIcon classes={newAccessionChipStyles()} />}
                color='primary'
                onDelete={() => {
                  return true;
                }}
              />
            </Link>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
}
