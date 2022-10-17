import { APP_PATHS } from 'src/constants';

const isForcedProductionView = () => {
  return sessionStorage !== undefined && Boolean(sessionStorage.getItem('productionView'));
};

const forceProductionView = (val: boolean) => {
  if (sessionStorage) {
    sessionStorage.setItem('productionView', val.toString());
    window.location.pathname = APP_PATHS.HOME;
  }
};

// Get web app environment
const useEnvironment = () => {
  const isProduction = isForcedProductionView() || !!window.location.origin.match(/^https:\/\/(www.)?terraware.io/);
  const isStaging = !isProduction && !!window.location.origin.match(/^https:\/\/(www.)?staging.terraware.io/);
  const isDev = !(isProduction || isStaging);

  return {
    isProduction,
    isStaging,
    isDev,
    isForcedProductionView,
    forceProductionView,
  };
};

export default useEnvironment;
