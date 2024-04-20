import React, { useEffect } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { useProject } from 'src/providers';
import { requestListModules } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectProjectModuleList } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

import CurrentTimeline from './CurrentTimeline';
import ModuleEntry from './ModuleEntry';

export default function ListView(): JSX.Element {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { project, projectId } = useProject();

  const modules = useAppSelector(selectProjectModuleList(projectId));
  // tslint:disable:no-console
  console.log(project, modules);

  // TODO - where will this be stored? Is this stored in the back end within another enum table?
  // Should we store it and localize it in the front end? Will it be stored somewhere an admin can edit it?
  // For now, I am hard coding it to get the UI done while we figure out where it belongs.
  const phaseDescription =
    'We have divided Phase 1 into a series of modules that will help you keep on track and ' +
    'provide resources like live workshops throughout your project. Each module has a specific timeframe, but you ' +
    'will need to review all deliverables over the course of Phase 1. A list of deliverables that you need to ' +
    'review is displayed in your To Do list on your home screen. Please login to Terraware regularly to check which ' +
    'deliverables are due or need review.';

  useEffect(() => {
    void dispatch(requestListModules(projectId));
  }, [dispatch, projectId]);

  return (
    <PageWithModuleTimeline title={strings.ALL_MODULES}>
      <Card style={{ width: '100%' }}>
        <CurrentTimeline cohortPhase={project?.cohortPhase} />

        <Box paddingY={theme.spacing(2)} borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}>
          <Typography>{phaseDescription}</Typography>
        </Box>

        {modules?.map((module, index) => (
          <ModuleEntry
            index={index}
            key={index}
            last={modules.length - 1 === index}
            module={module}
            projectId={projectId}
          />
        ))}
      </Card>
    </PageWithModuleTimeline>
  );
}
