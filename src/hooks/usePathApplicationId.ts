import { useMatch } from 'react-router';

import { APP_PATHS } from 'src/constants';

/**
 * The application id in the current URL, for both the application portal and the accelerator console.
 * Reads the location rather than route params, so it also works outside the portal's routes (e.g. its nav bar).
 */
const usePathApplicationId = (): number | undefined => {
  const portalMatch = useMatch(`${APP_PATHS.APPLICATION_OVERVIEW}/*`);
  const consoleMatch = useMatch(`${APP_PATHS.ACCELERATOR_APPLICATION}/*`);
  const applicationId = Number((portalMatch ?? consoleMatch)?.params.applicationId);
  return Number.isNaN(applicationId) ? undefined : applicationId;
};

export default usePathApplicationId;
