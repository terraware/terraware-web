import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

export default function useNavigateTo() {
  const history = useHistory();

  return {
    goToParticipantsList: useCallback(() => {
      history.push({
        pathname: APP_PATHS.ACCELERATOR_OVERVIEW,
        search: 'tab=participants',
      });
    }, [history]),
    goToParticipantProject: useCallback(
      (projectId: number) => {
        history.push({ pathname: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`) });
      },
      [history]
    ),
    goToParticipantProjectEdit: useCallback(
      (projectId: number) => {
        history.push({ pathname: APP_PATHS.ACCELERATOR_PROJECT_EDIT.replace(':projectId', `${projectId}`) });
      },
      [history]
    ),
    goToParticipantProjectList: useCallback(() => {
      history.push({
        pathname: APP_PATHS.ACCELERATOR_OVERVIEW,
        search: 'tab=projects',
      });
    }, [history]),
  };
}
