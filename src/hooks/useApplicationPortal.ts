import { useMatch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

const useApplicationPortal = () => {
  const isApplicationConsole = !!useMatch({ path: APP_PATHS.ACCELERATOR_APPLICATIONS, end: false });
  const isApplicationPortal = !!useMatch({ path: APP_PATHS.APPLICATION_OVERVIEW, end: false });

  return { isApplicationConsole, isApplicationPortal };
};

export default useApplicationPortal;
