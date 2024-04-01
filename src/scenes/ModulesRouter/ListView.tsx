import React, { useEffect } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { useProject } from 'src/providers';
import { requestListModules } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleList } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

import CurrentTimeline from './CurrentTimeline';

export default function ListView(): JSX.Element {
  const dispatch = useAppDispatch();

  const { project, projectId } = useProject();

  const modules = useAppSelector(selectModuleList(projectId));
  // tslint:disable:no-console
  console.log(project, modules);

  useEffect(() => {
    void dispatch(requestListModules(projectId));
  }, [dispatch, projectId]);

  return (
    <PageWithModuleTimeline title={strings.ALL_MODULES}>
      <Card style={{ width: '100%' }}>
        <CurrentTimeline />
      </Card>
    </PageWithModuleTimeline>
  );
}
