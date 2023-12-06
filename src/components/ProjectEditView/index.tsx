import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectProject } from 'src/redux/features/projects/projectsSelectors';
import { requestProject, requestProjectUpdate } from 'src/redux/features/projects/projectsThunks';
import TfMain from 'src/components/common/TfMain';
import strings from 'src/strings';
import ProjectForm from 'src/components/ProjectNewView/flow/ProjectForm';
import { UpdateProjectRequest } from 'src/types/Project';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { APP_PATHS } from 'src/constants';

export default function ProjectEditView(): JSX.Element {
  const dispatch = useAppDispatch();

  const history = useHistory();
  const location = useStateLocation();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const project = useAppSelector(selectProject(projectId));

  useEffect(() => {
    if (!project) {
      void dispatch(requestProject(projectId));
    }
  }, [projectId, project, dispatch]);

  const saveProject = useCallback(
    (_project: UpdateProjectRequest) => {
      dispatch(requestProjectUpdate({ projectId, project: _project }));
    },
    [dispatch, projectId]
  );

  const goToProject = useCallback(() => {
    const editProjectLocation = getLocation(
      APP_PATHS.PROJECT_EDIT.replace(':projectId', pathParams.projectId),
      location
    );
    history.push(editProjectLocation);
  }, [history, location, pathParams.projectId]);

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
