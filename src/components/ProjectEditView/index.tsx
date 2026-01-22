import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Typography } from '@mui/material';

import ProjectForm from 'src/components/ProjectNewView/flow/ProjectForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { requestProjectUpdate } from 'src/redux/features/projects/projectsAsyncThunks';
import { selectProject, selectProjectRequest } from 'src/redux/features/projects/projectsSelectors';
import { requestProject } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { UpdateProjectRequest } from 'src/types/Project';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

export default function ProjectEditView(): JSX.Element {
  const dispatch = useAppDispatch();

  const snackbar = useSnackbar();
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const project = useAppSelector(selectProject(projectId));
  const [requestId, setRequestId] = useState<string>('');
  const projectUpdateRequest = useAppSelector((state) => selectProjectRequest(state, requestId));

  useEffect(() => {
    if (!project) {
      void dispatch(requestProject(projectId));
    }
  }, [projectId, project, dispatch]);

  const saveProject = useCallback(
    (_project: UpdateProjectRequest) => {
      const dispatched = dispatch(requestProjectUpdate({ projectId, project: _project }));
      setRequestId(dispatched.requestId);
    },
    [dispatch, projectId]
  );

  const goToProject = useCallback(() => {
    if (pathParams.projectId) {
      navigate(getLocation(APP_PATHS.PROJECT_VIEW.replace(':projectId', pathParams.projectId), location));
    }
  }, [navigate, location, pathParams.projectId]);

  useEffect(() => {
    if (!projectUpdateRequest) {
      return;
    }

    if (projectUpdateRequest.status === 'error') {
      snackbar.toastError();
    } else if (projectUpdateRequest.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED, strings.SAVED);
      void dispatch(requestProject(projectId));
      goToProject();
    }
  }, [projectUpdateRequest, snackbar, goToProject, dispatch, projectId]);

  return (
    <TfMain>
      <Typography fontSize='24px' fontWeight={600}>
        {project?.name}
      </Typography>

      {project && (
        <ProjectForm<UpdateProjectRequest>
          onNext={saveProject}
          project={project}
          onCancel={goToProject}
          saveText={strings.SAVE}
        />
      )}
    </TfMain>
  );
}
