export type RequestIds = {
  [endpoint: string]: string;
};

export const requestIds: RequestIds = {};

export const setRequestId = (key: string, id?: string): string => {
  requestIds[key] = id || Math.random().toString();
  return getRequestId(key);
};

export const getRequestId = (key: string): string => requestIds[key] || '';
