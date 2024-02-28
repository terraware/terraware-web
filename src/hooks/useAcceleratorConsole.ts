import { useRouteMatch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';

const useAcceleratorConsole = () => {
  const featureFlagAccelerator = isEnabled('Accelerator');
  const isAcceleratorRoute = useRouteMatch(APP_PATHS.ACCELERATOR);

  return { featureFlagAccelerator, isAcceleratorRoute };
};

export default useAcceleratorConsole;
