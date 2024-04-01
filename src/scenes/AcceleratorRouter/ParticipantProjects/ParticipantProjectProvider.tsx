import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { requestAcceleratorOrgs } from 'src/redux/features/accelerator/acceleratorAsyncThunks';
import { selectAcceleratorOrgsRequest } from 'src/redux/features/accelerator/acceleratorSelectors';
import { requestGetParticipantProject } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { selectParticipantProjectRequest } from 'src/redux/features/participantProjects/participantProjectsSelectors';
import { selectProject } from 'src/redux/features/projects/projectsSelectors';
import { requestProject } from 'src/redux/features/projects/projectsThunks';
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
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const [participantProject, setParticipantProject] = useState<ParticipantProject>();
  const [participantProjectData, setParticipantProjectData] = useState<ParticipantProjectData>({
    crumbs: [],
    projectId,
    // tslint:disable-next-line:no-empty
    reload: () => {},
  });

  const getParticipantProjectResult = useAppSelector(selectParticipantProjectRequest(projectId));
  const project = useAppSelector(selectProject(projectId));

  const createdByUser = useAppSelector(selectUser(project?.createdBy));
  const modifiedByUser = useAppSelector(selectUser(project?.modifiedBy));
  const [projectMeta, setProjectMeta] = useState<ProjectMeta>({});

  const [organization, setOrganization] = useState<AcceleratorOrg>();
  const [orgRequestId, setOrgRequestId] = useState('');
  const getOrgsResult = useAppSelector(selectAcceleratorOrgsRequest(orgRequestId));

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
    void dispatch(requestGetParticipantProject(projectId));
    void dispatch(requestProject(projectId));
  }, [dispatch, projectId]);

  useEffect(() => {
    if (!isNaN(projectId)) {
      reload();
    }
  }, [dispatch, projectId, reload]);

  useEffect(() => {
    if (project?.organizationId) {
      const request = dispatch(requestAcceleratorOrgs({ locale: activeLocale }));
      setOrgRequestId(request.requestId);
    }
  }, [activeLocale, dispatch, project?.organizationId]);

  useEffect(() => {
    const userIds = new Set([project?.createdBy, project?.modifiedBy]);
    userIds.forEach((userId) => {
      if (userId) {
        dispatch(requestGetUser(userId));
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
    if (!getOrgsResult || !project) {
      return;
    }

    if (getOrgsResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (getOrgsResult?.status === 'success' && getOrgsResult?.data) {
      setOrganization(getOrgsResult.data.find((org) => org.id === project.organizationId));
    }
  }, [getOrgsResult, project, snackbar]);

  useEffect(() => {
    setParticipantProjectData({
      crumbs,
      organization,
      participantProject,
      project,
      projectId,
      projectMeta,
      status: getParticipantProjectResult?.status ?? 'pending',
      reload,
    });
  }, [crumbs, getParticipantProjectResult, organization, participantProject, project, projectId, projectMeta, reload]);

  return (
    <ParticipantProjectContext.Provider value={participantProjectData}>{children}</ParticipantProjectContext.Provider>
  );
};

export default ParticipantProjectProvider;
