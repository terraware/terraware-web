import { useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

export default function useNavigateTo() {
  const history = useHistory();

  return useMemo(
    () => ({
      goToModule: (projectId: number, moduleId: number) => {
        history.push({
          pathname: APP_PATHS.MODULES_FOR_PROJECT_CONTENT.replace(':projectId', `${projectId}`).replace(
            ':moduleId',
            `${moduleId}`
          ),
        });
      },

      goToParticipant: (participantId: number) => {
        history.push({
          pathname: APP_PATHS.ACCELERATOR_PARTICIPANTS_VIEW.replace(':participantId', `${participantId}`),
        });
      },

      goToParticipantsList: () => {
        history.push({
          pathname: APP_PATHS.ACCELERATOR_OVERVIEW,
          search: 'tab=participants',
        });
      },

      goToParticipantProject: (projectId: number) => {
        history.push({ pathname: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`) });
      },

      goToParticipantProjectEdit: (projectId: number) => {
        history.push({ pathname: APP_PATHS.ACCELERATOR_PROJECT_EDIT.replace(':projectId', `${projectId}`) });
      },

      goToParticipantProjectList: () => {
        history.push({
          pathname: APP_PATHS.ACCELERATOR_OVERVIEW,
          search: 'tab=projects',
        });
      },
    }),
    [history]
  );
}
