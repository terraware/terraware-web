/**
 * Define mocked implementations for http service functions
 */
import HttpService from '../HttpService';

export type Get = jest.MockedFunction<typeof HttpService.get>;
export type Get2 = jest.MockedFunction<typeof HttpService.get2>;
export type Put = jest.MockedFunction<typeof HttpService.put>;
export type Put2 = jest.MockedFunction<typeof HttpService.put2>;
export type Post = jest.MockedFunction<typeof HttpService.post>;
export type Post2 = jest.MockedFunction<typeof HttpService.post2>;
export type Delete = jest.MockedFunction<typeof HttpService.delete>;
export type Delete2 = jest.MockedFunction<typeof HttpService.delete2>;

export type MockedImpls = {
  get?: Get;
  get2?: Get2;
  put?: Put;
  put2?: Put2;
  post?: Post;
  post2?: Post2;
  delete?: Delete;
  delete2?: Delete2;
};

type Mocks = {
  mockedImpls?: MockedImpls;
};

const mockHttpService: Mocks = {};

/**
 * Mock the service, fallback to actual implementation if not mocked
 */
jest.mock('../HttpService', () => {
  const actual = jest.requireActual('../HttpService');

  const impls = {
    get: (...args: any[]) => (mockHttpService.mockedImpls?.get ?? actual.get)(args),
    get2: (...args: any[]) => (mockHttpService.mockedImpls?.get2 ?? actual.get2)(args),
    put: (...args: any[]) => (mockHttpService.mockedImpls?.put ?? actual.put)(args),
    put2: (...args: any[]) => (mockHttpService.mockedImpls?.put2 ?? actual.put2)(args),
    post: (...args: any[]) => (mockHttpService.mockedImpls?.post ?? actual.post)(args),
    post2: (...args: any[]) => (mockHttpService.mockedImpls?.post2 ?? actual.post2)(args),
    delete: (...args: any[]) => (mockHttpService.mockedImpls?.delete ?? actual.delete)(args),
    delete2: (...args: any[]) => (mockHttpService.mockedImpls?.delete2 ?? actual.delete2)(args),
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
  mockHttpService.mockedImpls = {
    get: get as Get,
    put: put as Put,
    post: post as Post,
    delete: del as Delete,
  };
};

/**
 * Client side function to clear the mocks
 */
const clearHttpServiceMocks = () => {
  mockHttpService.mockedImpls = undefined;
};

export { setHttpServiceMocks, clearHttpServiceMocks };
