import { AppBar, Grid, Toolbar } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Project } from '../api/types/project';
import projectSelector from '../state/selectors/project';
import projectsSelector from '../state/selectors/projects';
import Dropdown from './common/Dropdown';

const useStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      position: 'static',
      background: theme.palette.common.white,
    },
  })
);

export default function NavBar(): JSX.Element | null {
  const classes = useStyles();

  const projects = useRecoilValue(projectsSelector);

  const [project, setProject] = useRecoilState(projectSelector);

  useEffect(() => {
    if (projects && !project) {
      const firstProject = projects[0];
      setProject(firstProject);
    }
  }, [projects, project, setProject]);

  const getProjectById = (id: number): Project | undefined => {
    return projects?.find((iProject) => iProject.id === id);
  };

  return (
    <AppBar className={classes.appBar}>
      <Toolbar>
        <Grid container spacing={3}>
          <Grid item xs={2}>
            <Dropdown
              label='Projects'
              id='projects'
              values={projects?.map((value) => ({
                value: value.id?.toString() ?? '',
                label: value.name,
              }))}
              onChange={(id, value) =>
                setProject(getProjectById(parseInt(value, 10)))
              }
              selected={project?.id?.toString() ?? ''}
            />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
