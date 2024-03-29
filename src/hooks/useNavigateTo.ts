import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

export default function useNavigateTo() {
  const history = useHistory();

  const goToParticipant = useCallback(
    (participantId: number) => {
      history.push({
        pathname: APP_PATHS.ACCELERATOR_PARTICIPANTS_VIEW.replace(':participantId', `${participantId}`),
      });
    },
    [history]
  );

  const goToParticipantsList = useCallback(() => {
    history.push({
      pathname: APP_PATHS.ACCELERATOR_OVERVIEW,
      search: 'tab=participants',
    });
  }, [history]);

  const goToParticipantProject = useCallback(
    (projectId: number) => {
      history.push({ pathname: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`) });
    },
    [history]
  );

  const goToParticipantProjectEdit = useCallback(
    (projectId: number) => {
      history.push({ pathname: APP_PATHS.ACCELERATOR_PROJECT_EDIT.replace(':projectId', `${projectId}`) });
    },
    [history]
  );

  const goToParticipantProjectList = useCallback(() => {
    history.push({
      pathname: APP_PATHS.ACCELERATOR_OVERVIEW,
      search: 'tab=projects',
    });
  }, [history]);

  return useMemo(
    () => ({
      goToParticipant,
      goToParticipantsList,
      goToParticipantProject,
      goToParticipantProjectEdit,
      goToParticipantProjectList,
    }),
    [
      goToParticipant,
      goToParticipantsList,
      goToParticipantProject,
      goToParticipantProjectEdit,
      goToParticipantProjectList,
    ]
  );
}
