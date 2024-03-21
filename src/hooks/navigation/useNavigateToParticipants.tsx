import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

export type Response = () => void;

export default function useNavigateToParticipants(): Response {
  const history = useHistory();

  return useCallback(() => {
    history.push({
      pathname: APP_PATHS.ACCELERATOR_OVERVIEW,
      search: 'tab=participants',
    });
  }, [history]);
}
