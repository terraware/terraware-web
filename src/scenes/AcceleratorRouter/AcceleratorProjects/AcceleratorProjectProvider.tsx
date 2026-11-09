import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useProjectData } from 'src/providers/Project/ProjectContext';
import { useListAcceleratorOrganizationsQuery } from 'src/queries/generated/acceleratorOrganizations';
import { useLazyGetProjectAcceleratorDetailsQuery } from 'src/queries/generated/acceleratorProjects';
import { useGetUserQuery } from 'src/queries/generated/users';
import strings from 'src/strings';
import { AcceleratorProject } from 'src/types/AcceleratorProject';
import { ProjectMeta } from 'src/types/Project';
import useSnackbar from 'src/utils/useSnackbar';
import { getUserDisplayName } from 'src/utils/user';

import { AcceleratorProjectContext, AcceleratorProjectData } from './AcceleratorProjectContext';

type Props = {
  children: React.ReactNode;
};

const AcceleratorProjectProvider = ({ children }: Props) => {
  const { activeLocale } = useLocalization();
  const { project, projectId } = useProjectData();
  const snackbar = useSnackbar();
  const { currentData: acceleratorOrgsData, isError: isAcceleratorOrgsError } = useListAcceleratorOrganizationsQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    if (isAcceleratorOrgsError) {
      snackbar.toastError();
    }
  }, [isAcceleratorOrgsError, snackbar]);

  const [getProjectAcceleratorDetails, projectAcceleratorDetailsResponse] = useLazyGetProjectAcceleratorDetailsQuery();

  useEffect(() => {
    if (projectId !== -1) {
      void getProjectAcceleratorDetails(projectId, true);
    }
  }, [projectId, getProjectAcceleratorDetails]);

  const acceleratorProject: AcceleratorProject | undefined = useMemo(() => {
    if (projectAcceleratorDetailsResponse.isSuccess) {
      return projectAcceleratorDetailsResponse.data.details;
    }
  }, [projectAcceleratorDetailsResponse]);

  const [acceleratorProjectData, setAcceleratorProjectData] = useState<AcceleratorProjectData>({
    crumbs: [],
    projectId,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    reload: () => {},
  });

  const { currentData: createdByData } = useGetUserQuery(project?.createdBy ?? -1, { skip: !project?.createdBy });
  const { currentData: modifiedByData } = useGetUserQuery(project?.modifiedBy ?? -1, { skip: !project?.modifiedBy });
  const createdByUser = createdByData?.user;
  const modifiedByUser = modifiedByData?.user;
  const [projectMeta, setProjectMeta] = useState<ProjectMeta>({});

  const organization = useMemo(
    () => acceleratorOrgsData?.organizations.find((org) => org.id === project?.organizationId),
    [acceleratorOrgsData, project?.organizationId]
  );

  const crumbs: Crumb[] = useMemo(
    () => (activeLocale ? [{ name: strings.PROJECTS, to: `${APP_PATHS.ACCELERATOR_PROJECTS}` }] : []),
    [activeLocale]
  );

  const reload = useCallback(() => {
    if (projectId !== -1) {
      void getProjectAcceleratorDetails(projectId);
    }
  }, [projectId, getProjectAcceleratorDetails]);

  useEffect(() => {
    setProjectMeta({
      createdByUserName: getUserDisplayName(createdByUser),
      modifiedByUserName: getUserDisplayName(modifiedByUser),
    });
  }, [createdByUser, modifiedByUser]);

  const acceleratorProjectDataValues = useMemo(
    () => ({
      crumbs,
      organization,
      acceleratorProject,
      project,
      projectId,
      projectMeta,
      isLoading: projectAcceleratorDetailsResponse.isLoading,
      reload,
    }),
    [
      crumbs,
      organization,
      acceleratorProject,
      project,
      projectId,
      projectMeta,
      projectAcceleratorDetailsResponse.isLoading,
      reload,
    ]
  );

  useEffect(() => {
    setAcceleratorProjectData(acceleratorProjectDataValues);
  }, [acceleratorProjectDataValues]);

  return (
    <AcceleratorProjectContext.Provider value={acceleratorProjectData}>{children}</AcceleratorProjectContext.Provider>
  );
};

export default AcceleratorProjectProvider;
