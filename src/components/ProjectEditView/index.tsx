import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectProject } from 'src/redux/features/projects/projectsSelectors';
import { requestProject } from 'src/redux/features/projects/projectsThunks';
import TfMain from '../common/TfMain';

export default function ProjectEditView(): JSX.Element {
  const dispatch = useAppDispatch();

  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const project = useAppSelector(selectProject(projectId));

  useEffect(() => {
    if (!project) {
      void dispatch(requestProject(projectId));
    }
  }, [projectId, project, dispatch]);

  return (
    <TfMain>
      <Typography variant={'h3'}>{project?.name}</Typography>
    </TfMain>
  );
}
