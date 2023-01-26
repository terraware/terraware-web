import axios from './axios';

/**
 * Bare bones http service over an underlying implementation.
 */

/**
 * Url replacements
 */
export type Replacements = Record<string, string>;

/**
 * Request types
 */
export type Request = {
  url?: string; // override url to use
  urlReplacements?: Replacements;
  headers?: Record<string, any>;
  params?: Record<string, string>; // query params
};

export type GetRequest = Request;

export type PostRequest = Request & {
  entity?: Record<string, any>;
};

export type PutRequest = PostRequest;

export type PatchRequest = PostRequest;

export type DeleteRequest = PostRequest;

/**
 * Response type
 */
export type Response = {
  e?: Error;
  error?: string;
  data?: any;
  statusCode?: number;
  requestSucceeded: boolean;
};

/**
 * Utility to populate an error string from server response
 */
const addError = (source: any, destination: any) => {
  destination.error = source.error?.message;
};

/**
 * Utility to process the response to an http request from the server
 */
const handleRequest = async (httpPromise: Promise<object>): Promise<Response> => {
  const response: Response = {
    requestSucceeded: false,
  };

  try {
    const serverResponse: any = await httpPromise;
    if (serverResponse.status) {
      response.statusCode = serverResponse.status;
    }
    const data = serverResponse.data;
    if (data?.status === 'error') {
      addError(data, response);
    } else {
      response.requestSucceeded = true;
      response.data = data;
    }
  } catch (e: any) {
    response.e = e;
    addError(e?.response?.data || {}, response);
  }

  return response;
};

/**
 * Utility to replace placeholders with values in the url
 */
const replace = (url: string, request: Request) => {
  const replacements = request.urlReplacements || {};
  return Object.keys(replacements).reduce((accumulator, key) => {
    return accumulator.replaceAll(key, replacements[key]);
  }, request.url || url);
};

/**
 * Service with bare bones http function calls
 */
function RequestsHandler(url: string = '') {
  const get = async (request: GetRequest = {}): Promise<Response> => {
    const { params, headers } = request;

    return await handleRequest(axios.get(replace(url, request), { params, headers }));
  };

  const post = async (request: PostRequest = {}): Promise<Response> => {
    const { entity, params, headers } = request;

    return await handleRequest(axios.post(replace(url, request), entity, { params, headers }));
  };

  const put = async (request: PutRequest = {}): Promise<Response> => {
    const { entity, params, headers } = request;

    return await handleRequest(axios.put(replace(url, request), entity, { params, headers }));
  };

  const patch = async (request: PatchRequest = {}): Promise<Response> => {
    const { entity, params, headers } = request;

    return await handleRequest(axios.patch(replace(url, request), entity, { params, headers }));
  };

  const _delete = async (request: DeleteRequest = {}): Promise<Response> => {
    const { entity, params, headers } = request;

    return await handleRequest(axios.delete(replace(url, request), { params, headers, data: entity }));
  };

  return { get, post, put, patch, delete: _delete };
}

/**
 * Http utils
 */
const HttpUtils = {
  setDefaultHeaders: (headers: Record<string, any>) => {
    axios.defaults.headers = { ...axios.defaults.headers, ...headers };
  },

  getDefaultHeaders: (): Record<string, any> => ({
    ...(axios.defaults.headers || {}),
  }),
};

/**
 * Http service that handles simple http requests and provides some utilities.
 *
 * Usage examples:
 *
 *   // with url context
 *   const someService = HttpService.root('/someapi');
 *   someService.get({ params: { key: value }).then(...);
 *   someService.post({ entity: { name: 'some name' } });
 *
 *   // without url context
 *   const genericService = HttpService;
 *   genericService.post({ url: '/api/{id}', replacements: { '{id}': 123 }, entity: { name: 'some name' });
 *
 *   // utils
 *   HttpService.setDefaultHeaders({ header-name: <header-value> });
 */
const HttpService = {
  // http api, closure with url context
  root: (url: string) => RequestsHandler(url),

  // http api, no url context
  ...RequestsHandler(),

  // utils
  ...HttpUtils,
};

export default HttpService;
