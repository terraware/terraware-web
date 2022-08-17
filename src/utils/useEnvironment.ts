// Check if web app environment
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
