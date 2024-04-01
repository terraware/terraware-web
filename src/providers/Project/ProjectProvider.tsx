import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

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

  const [projectId, setProjectId] = useState<number>(-1);
  const project = useAppSelector(selectProject(projectId));

  const [projectData, setProjectData] = useState<ProjectData>({
    projectId,
    // tslint:disable-next-line:no-empty
    reload: () => {},
  });

  const reload = useCallback(() => {
    if (projectId !== -1) {
      void dispatch(requestProject(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (!isNaN(pathProjectId)) {
      setProjectId(pathProjectId);
      reload();
    }
  }, [dispatch, pathProjectId, reload]);

  useEffect(() => {
    setProjectData({
      project,
      projectId,
      reload,
    });
  }, [project, projectId, reload]);

  return <ProjectContext.Provider value={projectData}>{children}</ProjectContext.Provider>;
};

export default ProjectProvider;
