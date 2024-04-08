import { useRouteMatch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { useUser } from 'src/providers';
import { isAllowed } from 'src/utils/acl';

const useAcceleratorConsole = () => {
  const isAcceleratorRoute = !!useRouteMatch(APP_PATHS.ACCELERATOR);
  const { user } = useUser();

  const isAllowedViewConsole = user && isAllowed(user, 'VIEW_CONSOLE');

  return { isAcceleratorRoute, isAllowedViewConsole };
};

export default useAcceleratorConsole;
