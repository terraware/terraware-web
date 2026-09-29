import { useCallback, useMemo } from 'react';

import { useCreateApplicationMutation } from 'src/queries/generated/applications';
import { useCreateProjectMutation } from 'src/queries/generated/projects';

/**
 * Creates an application for an existing project, or for a new project created first.
 * Both resolve with the new application's id and reject if either request fails.
 */
const useCreateApplication = () => {
  const [createProject, createProjectResult] = useCreateProjectMutation();
  const [createApplication, createApplicationResult] = useCreateApplicationMutation();

  const createForProject = useCallback(
    async (projectId: number) => (await createApplication({ projectId }).unwrap()).id,
    [createApplication]
  );

  const createWithNewProject = useCallback(
    async (projectName: string, organizationId: number) => {
      const project = await createProject({ name: projectName, organizationId }).unwrap();
      return createForProject(project.id);
    },
    [createForProject, createProject]
  );

  const isLoading = createProjectResult.isLoading || createApplicationResult.isLoading;

  return useMemo(
    () => ({ createForProject, createWithNewProject, isLoading }),
    [createForProject, createWithNewProject, isLoading]
  );
};

export default useCreateApplication;
