import axios from 'axios';

const APPVERSION_ENDPOINT = '/build-version.txt';

type AppVersionResponse = {
  version: string;
  requestSucceeded: boolean;
};

export const getLatestAppVersion = async (): Promise<AppVersionResponse> => {
  const response: AppVersionResponse = {
    version: '',
    requestSucceeded: true,
  };

  try {
    const params = { timestamp: Date.now() };
    response.version = (await axios.get(APPVERSION_ENDPOINT, { params })).data;
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};
