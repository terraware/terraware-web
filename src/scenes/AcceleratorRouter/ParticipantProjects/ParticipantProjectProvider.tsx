import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import { useAcceleratorOrgs } from 'src/hooks/useAcceleratorOrgs';
import { useLocalization } from 'src/providers';
import { useProjectData } from 'src/providers/Project/ProjectContext';
import { requestGetParticipantProject } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { selectParticipantProjectRequest } from 'src/redux/features/participantProjects/participantProjectsSelectors';
import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUser } from 'src/redux/features/user/usersSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { ProjectMeta } from 'src/types/Project';
import useSnackbar from 'src/utils/useSnackbar';
import { getUserDisplayName } from 'src/utils/user';

import { ParticipantProjectContext, ParticipantProjectData } from './ParticipantProjectContext';

export type Props = {
  children: React.ReactNode;
};

const ParticipantProjectProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();
  const { project, projectId } = useProjectData();
  const { acceleratorOrgs, reload: reloadAll } = useAcceleratorOrgs({
    hasProjectApplication: true,
    includeParticipants: true,
  });

  const [participantProject, setParticipantProject] = useState<ParticipantProject>();
  const [participantProjectData, setParticipantProjectData] = useState<ParticipantProjectData>({
    crumbs: [],
    projectId,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    reload: () => {},
  });

  const getParticipantProjectResult = useAppSelector(selectParticipantProjectRequest(projectId));

  const createdByUser = useAppSelector(selectUser(project?.createdBy));
  const modifiedByUser = useAppSelector(selectUser(project?.modifiedBy));
  const [projectMeta, setProjectMeta] = useState<ProjectMeta>({});

  const [organization, setOrganization] = useState<AcceleratorOrg>();

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              name: strings.OVERVIEW,
              to: `${APP_PATHS.ACCELERATOR_OVERVIEW}?tab=projects`,
            },
          ]
        : [],
    [activeLocale]
  );

  const reload = useCallback(() => {
    reloadAll();
    if (projectId !== -1) {
      void dispatch(requestGetParticipantProject(projectId));
    }
  }, [dispatch, projectId, reloadAll]);

  useEffect(() => {
    if (projectId !== -1) {
      void dispatch(requestGetParticipantProject(projectId));
    }
  }, [dispatch, projectId]);

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
    if (!getParticipantProjectResult) {
      return;
    }

    if (getParticipantProjectResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (getParticipantProjectResult?.status === 'success' && getParticipantProjectResult?.data) {
      setParticipantProject(getParticipantProjectResult.data);
    }
  }, [getParticipantProjectResult, snackbar]);

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
      status: getParticipantProjectResult?.status ?? 'pending',
      reload,
    }),
    [
      crumbs,
      getParticipantProjectResult?.status,
      organization,
      participantProject,
      project,
      projectId,
      projectMeta,
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
