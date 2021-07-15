import { AppBar, Grid, Toolbar } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { projectAtom } from '../state/atoms/project';
import projectsSelector from '../state/selectors/projects';
import Dropdown, { DropdownItem } from './common/Dropdown';

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

  const [project, setProject] = useRecoilState(projectAtom);

  return (
    <AppBar className={classes.appBar}>
      <Toolbar>
        <Grid container spacing={3}>
          <Grid item xs={2}>
            <Dropdown
              label='Projects'
              id='projects'
              values={projects?.map((value) => {
                return {
                  value: value.id?.toString(),
                  label: value.name,
                } as DropdownItem;
              })}
              onChange={(id, value) => setProject(value)}
              selected={project}
            />
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
