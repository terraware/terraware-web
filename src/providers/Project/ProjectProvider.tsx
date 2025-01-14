import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { BusySpinner } from '@terraware/web-components';

import useNavigateTo from 'src/hooks/useNavigateTo';
import { selectProject } from 'src/redux/features/projects/projectsSelectors';
import { requestProject } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

import { ProjectContext, ProjectData } from './ProjectContext';

export type Props = {
  children: React.ReactNode;
};

const ProjectProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const pathParams = useParams<{ projectId: string }>();
  const pathProjectId = Number(pathParams.projectId);
  const { goToParticipantProjectList } = useNavigateTo();

  const [projectId, setProjectId] = useState<number>(-1);
  const project = useAppSelector(selectProject(projectId));

  const [projectData, setProjectData] = useState<ProjectData>({
    projectId,
    // eslint-disable-next-line no-empty
    reload: () => {},
  });

  const reload = useCallback(() => {
    if (projectId !== -1) {
      void dispatch(requestProject(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (pathProjectId === -1) {
      goToParticipantProjectList();
    } else if (!isNaN(pathProjectId)) {
      setProjectId(pathProjectId);
      reload();
    }
  }, [dispatch, goToParticipantProjectList, pathProjectId, reload]);

  useEffect(() => {
    setProjectData({
      project,
      projectId,
      reload,
    });
  }, [project, projectId, reload]);

  if (projectData.projectId === -1) {
    return <BusySpinner withSkrim />;
  }

  return <ProjectContext.Provider value={projectData}>{children}</ProjectContext.Provider>;
};

export default ProjectProvider;
