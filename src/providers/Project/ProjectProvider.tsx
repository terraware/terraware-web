import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import useNavigateTo from 'src/hooks/useNavigateTo';
import { useGetProjectQuery } from 'src/queries/generated/projects';

import { ProjectContext, ProjectData } from './ProjectContext';

export type Props = {
  children: React.ReactNode;
};

const ProjectProvider = ({ children }: Props) => {
  const pathParams = useParams<{ projectId: string }>();
  const pathProjectId = Number(pathParams.projectId);
  const { goToAcceleratorProjectList } = useNavigateTo();

  const projectId = !isNaN(pathProjectId) ? pathProjectId : -1;
  const { data } = useGetProjectQuery(projectId, { skip: projectId === -1 });
  const project = data?.project;

  const projectData = useMemo<ProjectData>(
    () => ({
      project,
      projectId,
    }),
    [project, projectId]
  );

  useEffect(() => {
    if (pathProjectId === -1) {
      goToAcceleratorProjectList();
    }
  }, [goToAcceleratorProjectList, pathProjectId]);

  if (projectData.projectId === -1) {
    return <BusySpinner withSkrim />;
  }

  return <ProjectContext.Provider value={projectData}>{children}</ProjectContext.Provider>;
};

export default ProjectProvider;
