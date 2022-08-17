// Check if web app is in production mode - check for both https://www.terraware.io and https://terraware.io
const useEnvironment = () => {
  const isProduction = !!window.location.origin.match(/^https:\/\/(www.)?terraware.io/);
  const isStaging = !!window.location.origin.match(/^https:\/\/(www.)?staging.terraware.io/);
  const isDev = !(isProduction || isStaging);

  return {
    isProduction,
    isStaging,
    isDev,
  };
};

export default useEnvironment;
