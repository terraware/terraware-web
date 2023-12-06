import axios, { AxiosResponse } from './axios';

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

export type ServerData = { status?: 'ok' | 'error' };

export type Params = Record<string, string>;

export type Request = {
  url?: string; // override url to use
  urlReplacements?: Replacements;
  headers?: Record<string, any>;
  params?: Params; // query params
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

export type Response2<T> = {
  e?: Error;
  error?: string;
  data?: T;
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
async function handleRequest<I extends ServerData, O>(
  httpPromise: Promise<AxiosResponse<I>>,
  transform: (i?: I) => O
): Promise<O & Response> {
  const response: Response = {
    requestSucceeded: false,
  };

  try {
    const serverResponse: AxiosResponse<I> = await httpPromise;
    if (serverResponse.status) {
      response.statusCode = serverResponse.status;
    }
    const data: I = serverResponse.data;
    if (data?.status === 'error') {
      addError(data, response);
    } else {
      response.requestSucceeded = true;
      return { ...response, ...transform(data) };
    }
  } catch (e: any) {
    response.e = e;
    addError(e?.response?.data || {}, response);
    response.statusCode = e?.response?.status;
  }

  return { ...response, ...transform() };
}

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
  async function get<I extends ServerData, O>(request: GetRequest, transform: (i?: I) => O): Promise<O & Response> {
    const { params, headers } = request;

    return await handleRequest(axios.get<I>(replace(url, request), { params, headers }), transform);
  }

  const post = async (request: PostRequest = {}): Promise<Response> => {
    const { entity, params, headers } = request;

    return await handleRequest(axios.post(replace(url, request), entity, { params, headers }), (data) => ({ data }));
  };

  const post2 = async <T extends ServerData>(request: PostRequest = {}): Promise<Response2<T>> => {
    const { entity, params, headers } = request;

    return await handleRequest<T, { data: T | undefined }>(
      axios.post<T>(replace(url, request), entity, { params, headers }),
      (data: T | undefined) => ({ data })
    );
  };

  const put = async (request: PutRequest = {}): Promise<Response> => {
    const { entity, params, headers } = request;

    return await handleRequest(axios.put(replace(url, request), entity, { params, headers }), (data) => ({ data }));
  };

  const put2 = async <T extends ServerData>(request: PutRequest = {}): Promise<Response2<T>> => {
    const { entity, params, headers } = request;

    return await handleRequest<T, { data: T | undefined }>(
      axios.put<T>(replace(url, request), entity, { params, headers }),
      (data: T | undefined) => ({ data })
    );
  };

  const _delete = async (request: DeleteRequest = {}): Promise<Response> => {
    const { entity, params, headers } = request;

    return await handleRequest(axios.delete(replace(url, request), { params, headers, data: entity }), (data) => ({
      data,
    }));
  };

  return { get, post, post2, put, put2, delete: _delete };
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
