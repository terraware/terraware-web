import { AppBar, Grid, Toolbar } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { projectIdAtom } from '../state/atoms/project';
import projectsSelector from '../state/selectors/projects';
import sessionSelector from '../state/selectors/session';
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

  const session = useRecoilValue(sessionSelector);

  const projects = useRecoilValue(projectsSelector(session));

  const [project, setProject] = useRecoilState(projectIdAtom);

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
              onChange={(id, value) => setProject(value)}
              selected={project}
            />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
