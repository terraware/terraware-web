import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { requestGetParticipantProject } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { selectParticipantProjectRequest } from 'src/redux/features/participantProjects/participantProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
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
  });

  const getParticipantProjectResult = useAppSelector(selectParticipantProjectRequest(projectId));

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              name: strings.OVERVIEW,
              to: `${APP_PATHS.ACCELERATOR_OVERVIEW}?tab=projects`,
            },
            {
              name: strings.PROJECTS,
              // TODO should this go somewhere else?
              to: `${APP_PATHS.ACCELERATOR_OVERVIEW}?tab=projects`,
            },
            {
              name: participantProject?.name || '',
              to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`),
            },
          ]
        : [],
    [activeLocale, projectId, participantProject?.name]
  );

  useEffect(() => {
    if (!isNaN(projectId)) {
      void dispatch(requestGetParticipantProject(projectId));
    }
  }, [dispatch, projectId]);

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
    setParticipantProjectData({
      crumbs,
      projectId,
      project: participantProject,
      status: getParticipantProjectResult?.status ?? 'pending',
    });
  }, [crumbs, participantProject, projectId, getParticipantProjectResult]);

  return (
    <ParticipantProjectContext.Provider value={participantProjectData}>{children}</ParticipantProjectContext.Provider>
  );
};

export default ParticipantProjectProvider;
