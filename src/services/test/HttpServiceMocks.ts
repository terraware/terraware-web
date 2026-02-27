/**
 * Define mocked implementations for http service functions
 */
import { Mocked, rstest } from '@rstest/core';

import HttpService from '../HttpService';

export type Get = Mocked<typeof HttpService.get>;
export type Get2 = Mocked<typeof HttpService.get2>;
export type Put = Mocked<typeof HttpService.put>;
export type Put2 = Mocked<typeof HttpService.put2>;
export type Post = Mocked<typeof HttpService.post>;
export type Post2 = Mocked<typeof HttpService.post2>;
export type Delete = Mocked<typeof HttpService.delete>;
export type Delete2 = Mocked<typeof HttpService.delete2>;

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
rstest.mock('../HttpService', () => {
  const actual = rstest.requireActual<any>('../HttpService');

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
    default: {
      root: () => impls,
      ...impls,
    },
  };
});

/**
 * Client side function to set the mocks.
 * Typing the input as 'any' for easier use.
 */
const setHttpServiceMocks = (mocks: any) => {
  const { get, get2, put, put2, post, post2, delete: del, delete2: del2 } = mocks;
  mockHttpService.mockedImpls = {
    get: get as Get,
    get2: get2 as Get2,
    put: put as Put,
    put2: put2 as Put2,
    post: post as Post,
    post2: post2 as Post2,
    delete: del as Delete,
    delete2: del2 as Delete2,
  };
};

/**
 * Client side function to clear the mocks
 */
const clearHttpServiceMocks = () => {
  mockHttpService.mockedImpls = undefined;
};

export { setHttpServiceMocks, clearHttpServiceMocks };
