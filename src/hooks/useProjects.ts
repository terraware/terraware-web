import { useCallback, useMemo } from 'react';

import { useLocalization, useOrganization } from 'src/providers';
import { useListProjectsQuery } from 'src/queries/generated/projects';
import { Project } from 'src/types/Project';

import useAcceleratorConsole from './useAcceleratorConsole';

export const useProjects = (record?: { projectId?: number }) => {
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const organizationId = isAcceleratorRoute ? undefined : selectedOrganization?.id;
  const { data } = useListProjectsQuery(organizationId, {
    skip: !isAcceleratorRoute && selectedOrganization === undefined,
  });

  const availableProjects = useMemo<Project[] | undefined>(
    () =>
      data?.projects
        ? [...data.projects].sort((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
        : undefined,
    [activeLocale, data]
  );

  const getProjectName = useCallback(
    (projectId: number) => (availableProjects?.find((project: Project) => project.id === projectId) || {}).name || '',
    [availableProjects]
  );

  const recordProjectId = record?.projectId;
  const selectedProject = useMemo(
    () =>
      availableProjects && recordProjectId
        ? availableProjects.find((project) => project.id === recordProjectId)
        : undefined,
    [availableProjects, recordProjectId]
  );

  return { availableProjects, getProjectName, selectedProject };
};
