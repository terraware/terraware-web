import { useCallback, useEffect, useState } from 'react';

import { useOrganization } from 'src/providers';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Project } from 'src/types/Project';

import useAcceleratorConsole from './useAcceleratorConsole';

export const useProjects = (record?: { projectId?: number }) => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const availableProjects = useAppSelector(selectProjects);

  const [selectedProject, setSelectedProject] = useState<Project>();

  const getProjectName = useCallback(
    (projectId: number) => (availableProjects?.find((project: Project) => project.id === projectId) || {}).name || '',
    [availableProjects]
  );

  useEffect(() => {
    if (availableProjects && record?.projectId) {
      setSelectedProject(availableProjects.find((project) => project.id === record.projectId));
    } else {
      setSelectedProject(undefined);
    }
  }, [availableProjects, record?.projectId]);

  useEffect(() => {
    if (!availableProjects) {
      void dispatch(requestProjects(selectedOrganization.id));
    }
  }, [availableProjects, dispatch, selectedOrganization.id]);

  // fetch all projects in the accelerator route
  useEffect(() => {
    if (isAcceleratorRoute) {
      void dispatch(requestProjects());
    }
  }, [isAcceleratorRoute, dispatch]);

  return { availableProjects, getProjectName, selectedProject };
};
