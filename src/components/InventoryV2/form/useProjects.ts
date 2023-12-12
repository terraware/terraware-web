import { useEffect, useState } from 'react';
import { useAppSelector } from 'src/redux/store';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { Project } from 'src/types/Project';

export const useProjects = (record?: { projectId?: number }) => {
  const availableProjects = useAppSelector(selectProjects);
  const [selectedProject, setSelectedProject] = useState<Project>();

  useEffect(() => {
    if (availableProjects && record?.projectId) {
      setSelectedProject(availableProjects.find((project) => project.id === record.projectId));
    }
  }, [availableProjects, record?.projectId]);

  return { availableProjects, selectedProject };
};
