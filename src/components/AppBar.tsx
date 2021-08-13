import { AppBar, Grid, Toolbar } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import projectIdSelector from '../state/selectors/projectId';
import projectsSelector from '../state/selectors/projects';
import strings from '../strings';
import Dropdown from './common/Dropdown';

const useStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      background: theme.palette.common.white,
    },
  })
);

export default function NavBar(): JSX.Element | null {
  const classes = useStyles();

  return (
    <AppBar position='static' className={classes.appBar}>
      <Toolbar>
        <Grid container spacing={3}>
          <Grid item>
            <React.Suspense fallback={strings.LOADING}>
              <ProjectsDropdown />
            </React.Suspense>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}

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
