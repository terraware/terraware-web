import { useMatch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

const useApplicationPortal = () => {
  const isApplicationPortal = !!useMatch({ path: APP_PATHS.APPLICATION_OVERVIEW, end: false });

  return { isApplicationPortal };
};

export default useApplicationPortal;
