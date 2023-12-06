import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { Crumb, Page } from 'src/components/BreadCrumbs';
import Card from 'src/components/common/Card';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import theme from 'src/theme';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectProject } from 'src/redux/features/projects/projectsSelectors';
import { requestProject } from 'src/redux/features/projects/projectsThunks';

const crumbs: Crumb[] = [
  {
    name: strings.PROJECTS,
    to: APP_PATHS.PROJECTS,
  },
];

export default function ProjectView(): JSX.Element {
  const dispatch = useAppDispatch();

  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const project = useAppSelector(selectProject(projectId));

  useEffect(() => {
    if (!project) {
      void dispatch(requestProject(projectId));
    }
  }, [projectId, project, dispatch]);

  const makeFieldLabel = (label: string) => (
    <Typography color={theme.palette.TwClrTxtSecondary} sx={{ marginBottom: theme.spacing(1) }}>
      {label}
    </Typography>
  );

  const makeFieldValue = (value: string | undefined) => (
    <Typography
      color={theme.palette.TwClrTxt}
      fontSize={theme.typography.h6.fontSize}
      sx={{ marginBottom: theme.spacing(2) }}
    >
      {value}
    </Typography>
  );

  return (
    <Page crumbs={crumbs} title={project?.name || ''}>
      <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: '24px' }}>
        <Grid container>
          <Grid item xs={4}>
            {makeFieldLabel(strings.NAME)}
            {makeFieldValue(project?.name)}
          </Grid>
          <Grid item xs={8}>
            {makeFieldLabel(strings.DESCRIPTION)}
            {makeFieldValue(project?.description)}
          </Grid>
        </Grid>
      </Card>
    </Page>
  );
}
