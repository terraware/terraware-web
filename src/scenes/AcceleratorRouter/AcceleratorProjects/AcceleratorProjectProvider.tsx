import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import { useAcceleratorOrgs } from 'src/hooks/useAcceleratorOrgs';
import { useLocalization } from 'src/providers';
import { useProjectData } from 'src/providers/Project/ProjectContext';
import { useLazyGetProjectAcceleratorDetailsQuery } from 'src/queries/generated/acceleratorProjects';
import { useGetUserQuery } from 'src/queries/generated/users';
import strings from 'src/strings';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { AcceleratorProject } from 'src/types/AcceleratorProject';
import { ProjectMeta } from 'src/types/Project';
import { getUserDisplayName } from 'src/utils/user';

import { AcceleratorProjectContext, AcceleratorProjectData } from './AcceleratorProjectContext';

export type Props = {
  children: React.ReactNode;
};

const AcceleratorProjectProvider = ({ children }: Props) => {
  const { activeLocale } = useLocalization();
  const { project, projectId } = useProjectData();
  const { acceleratorOrgs, reload: reloadAll } = useAcceleratorOrgs();

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

  const [organization, setOrganization] = useState<AcceleratorOrg>();

  const crumbs: Crumb[] = useMemo(
    () => (activeLocale ? [{ name: strings.PROJECTS, to: `${APP_PATHS.ACCELERATOR_PROJECTS}` }] : []),
    [activeLocale]
  );

  const reload = useCallback(() => {
    reloadAll();
    if (projectId !== -1) {
      void getProjectAcceleratorDetails(projectId);
    }
  }, [projectId, reloadAll, getProjectAcceleratorDetails]);

  useEffect(() => {
    setProjectMeta({
      createdByUserName: getUserDisplayName(createdByUser),
      modifiedByUserName: getUserDisplayName(modifiedByUser),
    });
  }, [createdByUser, modifiedByUser]);

  useEffect(() => {
    if (!acceleratorOrgs || !project?.organizationId) {
      return;
    }

    setOrganization(acceleratorOrgs.find((org) => org.id === project.organizationId));
  }, [acceleratorOrgs, project?.organizationId]);

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
