import HttpService, { Response2 } from './HttpService';

const FILE_TOKEN_ENDPOINT = '/api/v1/files/tokens/{token}';

/**
 * Get file content using a token
 */
const getFileForToken = async (token: string): Promise<Response2<any>> => {
  return HttpService.root(FILE_TOKEN_ENDPOINT).get2<any>({
    urlReplacements: { '{token}': token },
  });
};

const FileService = {
  getFileForToken,
};

export default FileService;
