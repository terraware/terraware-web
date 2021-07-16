import { AppBar, Grid, Toolbar } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import projectIdSelector from '../state/selectors/projectId';
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

  const [projectId, setProjectId] = useRecoilState(projectIdSelector);

  useEffect(() => {
    if (projects && !projectId) {
      const firstProject = projects[0];
      if (firstProject.id) {
        setProjectId(firstProject.id);
      }
    }
  }, [projects, projectId, setProjectId]);

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
              onChange={(id, value) => setProjectId(parseInt(value, 10))}
              selected={projectId?.toString() ?? ''}
            />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
