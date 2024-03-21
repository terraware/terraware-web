import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

export default function useParticipantProjectsNav(projectId?: number) {
  const history = useHistory();

  return {
    goToParticipantProject: useCallback(() => {
      history.push({ pathname: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`) });
    }, [history, projectId]),
    goToParticipantProjectEdit: useCallback(() => {
      history.push({ pathname: APP_PATHS.ACCELERATOR_PROJECT_EDIT.replace(':projectId', `${projectId}`) });
    }, [history, projectId]),
    goToParticipantProjectList: useCallback(() => {
      history.push({ pathname: `${APP_PATHS.ACCELERATOR_OVERVIEW}?tab=projects` });
    }, [history]),
  };
}
