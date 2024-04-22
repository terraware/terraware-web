import { useLocation } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { useUser } from 'src/providers';
import { isAllowed } from 'src/utils/acl';

const useAcceleratorConsole = () => {
  const { user } = useUser();
  const location = useLocation();
  const isAcceleratorRoute = location.pathname.startsWith(APP_PATHS.ACCELERATOR);

  const isAllowedViewConsole = user && isAllowed(user, 'VIEW_CONSOLE');

  return { isAcceleratorRoute, isAllowedViewConsole };
};

export default useAcceleratorConsole;
