import { useEffect, useState } from 'react';
import { useOrganization } from 'src/providers';
import { Project } from 'src/types/Project';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';

export const useProjects = (record?: { projectId?: number }) => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();

  const availableProjects = useAppSelector(selectProjects);

  const [selectedProject, setSelectedProject] = useState<Project>();

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

  return { availableProjects, selectedProject };
};
