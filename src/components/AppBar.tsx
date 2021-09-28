import { AppBar, Grid, IconButton, Link, Toolbar } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import HelpIcon from '@material-ui/icons/Help';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import ErrorBoundary from '../ErrorBoundary';
import projectIdSelector from '../state/selectors/projectId';
import projectsSelector from '../state/selectors/projects';
import strings from '../strings';
import useStateLocation, { getLocation } from '../utils/useStateLocation';
import Dropdown from './common/Dropdown';
import NotificationsDropdown from './NotificationsDropdown';
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
    },
  })
);

export default function NavBar(): JSX.Element | null {
  const classes = useStyles();
  const location = useStateLocation();

  return (
    <AppBar position='static' className={classes.appBar}>
      <Toolbar>
        <Grid container spacing={3}>
          <Grid item>
            <ErrorBoundary>
              <React.Suspense fallback={strings.LOADING}>
                <ProjectsDropdown />
              </React.Suspense>
            </ErrorBoundary>
          </Grid>
          <Grid item className={classes.right}>
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
              <div className={classes.separator} />
              <UserMenu />
            </div>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ProjectsDropdown(): JSX.Element {
  const projects = useRecoilValue(projectsSelector);
  const [projectId, setProjectId] = useRecoilState(projectIdSelector);

  React.useEffect(() => {
    if (projects && !projectId) {
      const firstProject = projects[0];
      setProjectId(firstProject.id);
    }
  }, [projects, projectId, setProjectId]);

  return (
    <Dropdown
      label={strings.PROJECTS}
      id='projects'
      values={projects?.map((value) => ({
        value: value.id?.toString() ?? '',
        label: value.name,
      }))}
      onChange={(id, value) => setProjectId(parseInt(value, 10))}
      selected={projectId?.toString() ?? ''}
    />
  );
}
