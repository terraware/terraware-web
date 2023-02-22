/**
 * Define mocked implementations for http service functions
 */
import HttpService from '../HttpService';

export type Get = jest.MockedFunction<typeof HttpService.get>;
export type Put = jest.MockedFunction<typeof HttpService.put>;
export type Post = jest.MockedFunction<typeof HttpService.post>;
export type Delete = jest.MockedFunction<typeof HttpService.delete>;

export type MockedImpls = {
  get?: Get;
  put?: Put;
  post?: Post;
  delete?: Delete;
};

type Mocks = {
  mockedImpls?: MockedImpls;
};

const httpServiceMocks: Mocks = {};

/**
 * Mock the service, fallback to actual implementation if not mocked
 */
jest.mock('../HttpService', () => {
  const actual = jest.requireActual('../HttpService');

  const impls = {
    get: (...args: any[]) => (httpServiceMocks.mockedImpls?.get ?? actual.get)(args),
    put: (...args: any[]) => (httpServiceMocks.mockedImpls?.put ?? actual.put)(args),
    post: (...args: any[]) => (httpServiceMocks.mockedImpls?.post ?? actual.post)(args),
    delete: (...args: any[]) => (httpServiceMocks.mockedImpls?.delete ?? actual.delete)(args),
  };

  return {
    __esModules: true,
    root: () => impls,
    ...impls,
  };
});

/**
 * Client side function to set the mocks.
 * Typing the input as 'any' for easier use.
 */
const setHttpServiceMocks = (mocks: any) => {
  const { get, put, post, delete: del } = mocks;
  httpServiceMocks.mockedImpls = {
    get: get as Get,
    put: put as Put,
    post: put as Post,
    delete: del as Delete,
  };
};

/**
 * Client side function to clear the mocks
 */
const clearHttpServiceMocks = () => {
  httpServiceMocks.mockedImpls = undefined;
};

export { setHttpServiceMocks, clearHttpServiceMocks };
