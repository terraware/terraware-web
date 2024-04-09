import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

export default function useNavigateTo() {
  const navigate = useNavigate();

  return useMemo(
    () => ({
      goToModule: (projectId: number, moduleId: number) => {
        navigate({
          pathname: APP_PATHS.MODULES_FOR_PROJECT_CONTENT.replace(':projectId', `${projectId}`).replace(
            ':moduleId',
            `${moduleId}`
          ),
        });
      },

      goToParticipant: (participantId: number) => {
        navigate({
          pathname: APP_PATHS.ACCELERATOR_PARTICIPANTS_VIEW.replace(':participantId', `${participantId}`),
        });
      },

      goToParticipantsList: () => {
        navigate({
          pathname: APP_PATHS.ACCELERATOR_OVERVIEW,
          search: 'tab=participants',
        });
      },

      goToParticipantProject: (projectId: number) => {
        navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`) });
      },

      goToParticipantProjectEdit: (projectId: number) => {
        navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECT_EDIT.replace(':projectId', `${projectId}`) });
      },

      goToParticipantProjectList: () => {
        navigate({
          pathname: APP_PATHS.ACCELERATOR_OVERVIEW,
          search: 'tab=projects',
        });
      },
    }),
    [navigate]
  );
}
