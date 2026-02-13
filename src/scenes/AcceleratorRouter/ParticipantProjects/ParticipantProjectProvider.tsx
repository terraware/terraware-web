import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import { useAcceleratorOrgs } from 'src/hooks/useAcceleratorOrgs';
import { useLocalization } from 'src/providers';
import { useProjectData } from 'src/providers/Project/ProjectContext';
import { useLazyGetProjectAcceleratorDetailsQuery } from 'src/queries/generated/acceleratorProjects';
import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUser } from 'src/redux/features/user/usersSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { ProjectMeta } from 'src/types/Project';
import { getUserDisplayName } from 'src/utils/user';

import { ParticipantProjectContext, ParticipantProjectData } from './ParticipantProjectContext';

export type Props = {
  children: React.ReactNode;
};

const ParticipantProjectProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { project, projectId } = useProjectData();
  const { acceleratorOrgs, reload: reloadAll } = useAcceleratorOrgs({
    hasProjectApplication: true,
    includeParticipants: true,
  });

  const [getProjectAcceleratorDetails, projectAcceleratorDetailsResponse] = useLazyGetProjectAcceleratorDetailsQuery();

  useEffect(() => {
    if (projectId !== -1) {
      void getProjectAcceleratorDetails(projectId);
    }
  }, [projectId, getProjectAcceleratorDetails]);

  const participantProject: ParticipantProject | undefined = useMemo(() => {
    if (projectAcceleratorDetailsResponse.isSuccess) {
      return projectAcceleratorDetailsResponse.data.details;
    }
  }, [projectAcceleratorDetailsResponse]);

  const [participantProjectData, setParticipantProjectData] = useState<ParticipantProjectData>({
    crumbs: [],
    projectId,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    reload: () => {},
  });

  const createdByUser = useAppSelector(selectUser(project?.createdBy));
  const modifiedByUser = useAppSelector(selectUser(project?.modifiedBy));
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
    const userIds = new Set([project?.createdBy, project?.modifiedBy]);
    userIds.forEach((userId) => {
      if (userId) {
        void dispatch(requestGetUser(userId));
      }
    });
  }, [dispatch, project?.createdBy, project?.modifiedBy]);

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

  const participantProjectDataValues = useMemo(
    () => ({
      crumbs,
      organization,
      participantProject,
      project,
      projectId,
      projectMeta,
      isLoading: projectAcceleratorDetailsResponse.isLoading,
      reload,
    }),
    [
      crumbs,
      organization,
      participantProject,
      project,
      projectId,
      projectMeta,
      projectAcceleratorDetailsResponse.isLoading,
      reload,
    ]
  );

  useEffect(() => {
    setParticipantProjectData(participantProjectDataValues);
  }, [participantProjectDataValues]);

  return (
    <ParticipantProjectContext.Provider value={participantProjectData}>{children}</ParticipantProjectContext.Provider>
  );
};

export default ParticipantProjectProvider;
