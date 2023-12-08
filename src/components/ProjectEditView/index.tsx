import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectProject, selectProjectRequest } from 'src/redux/features/projects/projectsSelectors';
import { requestProject } from 'src/redux/features/projects/projectsThunks';
import TfMain from 'src/components/common/TfMain';
import strings from 'src/strings';
import ProjectForm from 'src/components/ProjectNewView/flow/ProjectForm';
import { UpdateProjectRequest } from 'src/types/Project';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { APP_PATHS } from 'src/constants';
import { requestProjectUpdate } from 'src/redux/features/projects/projectsAsyncThunks';
import useSnackbar from 'src/utils/useSnackbar';

export default function ProjectEditView(): JSX.Element {
  const dispatch = useAppDispatch();

  const snackbar = useSnackbar();
  const history = useHistory();
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

  const goToProject = useCallback(
    () => history.push(getLocation(APP_PATHS.PROJECT_VIEW.replace(':projectId', pathParams.projectId), location)),
    [history, location, pathParams.projectId]
  );

  useEffect(() => {
    if (!projectUpdateRequest) {
      return;
    }

    if (projectUpdateRequest.status === 'error') {
      snackbar.toastError();
    } else if (projectUpdateRequest.status === 'success') {
      goToProject();
    }
  }, [projectUpdateRequest, snackbar, goToProject]);

  return (
    <TfMain>
      <Typography variant={'h3'}>{project?.name}</Typography>

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
