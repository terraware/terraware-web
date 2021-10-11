/**
 * Creates and returns a string by combining the endpoint with the query params
 * @param endpoint endpoint to use
 * @param params query params to append to the endpoint
 * @returns string with the combination of the endpoint and the query params. For example endpoint?paramKey1=paramValue1&paramKey2=paramValue2
 */
export const addQueryParams = (endpoint: string, params: Record<string, unknown>): string => {
  let updatedEndpoint = endpoint;

  const keys = Object.keys(params);
  keys.forEach((key) => {
    if (params[key]) {
      updatedEndpoint = updatedEndpoint.includes('?') ? updatedEndpoint.concat('&') : updatedEndpoint.concat('?');
      updatedEndpoint = updatedEndpoint.concat(`${String(key)}=${params[key]}`);
    }
  });

  return updatedEndpoint;
};
