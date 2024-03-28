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
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { ParticipantProject } from 'src/types/ParticipantProject';
import useSnackbar from 'src/utils/useSnackbar';

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
    reload: () => {},
  });

  const getParticipantProjectResult = useAppSelector(selectParticipantProjectRequest(projectId));
  const project = useAppSelector(selectProject(projectId));

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
      participantProject: participantProject,
      project: project,
      projectId,
      status: getParticipantProjectResult?.status ?? 'pending',
      reload,
    });
  }, [crumbs, getParticipantProjectResult, organization, participantProject, project, projectId, reload]);

  return (
    <ParticipantProjectContext.Provider value={participantProjectData}>{children}</ParticipantProjectContext.Provider>
  );
};

export default ParticipantProjectProvider;
