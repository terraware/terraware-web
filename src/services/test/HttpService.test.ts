import { Mocked, rstest } from '@rstest/core';

import axios from '../axios';
import HttpService, { Response, ServerData } from '../HttpService';

rstest.mock('../axios', { mock: true });

type DummyData = ServerData & {
  status: string;
};

type Get = {
  value?: string;
};

const DUMMY_DATA = {
  data: { status: 'ok' },
  status: 200,
};

const DUMMY_ERROR = (statusCode: number = 500, error: string = 'Dummy error') => ({
  data: {
    error: {
      message: error,
    },
    status: 'error',
  },
  status: statusCode,
});

const DUMMY_ERROR_EXCEPTION = (statusCode: number = 500, error: string = 'Dummy error') => ({
  response: {
    data: {
      error: {
        message: error,
      },
    },
    status: statusCode,
  },
});

/* eslint-disable @typescript-eslint/unbound-method */
const axiosGet = axios.get as Mocked<typeof axios.get>;
const axiosPut = axios.put as Mocked<typeof axios.put>;
const axiosPost = axios.post as Mocked<typeof axios.post>;
const axiosDelete = axios.delete as Mocked<typeof axios.delete>;
/* eslint-enable @typescript-eslint/unbound-method */

describe('HttpService', () => {
  describe('request success handling', () => {
    test('HttpService.get handles successful requests', async () => {
      axiosGet.mockImplementation(() => Promise.resolve(DUMMY_DATA));
      const response: Response & Get = await HttpService.root('/url-name').get<DummyData, Get>(
        { headers: {}, params: {} },
        (data) => ({
          value: data?.status,
        }),
      );

      expect(response.requestSucceeded).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.value).toBe('ok');
      expect(axiosGet).toHaveBeenCalledWith('/url-name', { headers: {}, params: {} });
    });

    test('HttpService.put handles successful requests', async () => {
      axiosPut.mockImplementation(() => Promise.resolve(DUMMY_DATA));
      const response: Response = await HttpService.root('/url-name').put({ entity: {}, headers: {}, params: {} });

      expect(response.requestSucceeded).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data.status).toBe('ok');
      expect(axiosPut).toHaveBeenCalledWith('/url-name', {}, { headers: {}, params: {} });
    });

    test('HttpService.post handles successful requests', async () => {
      axiosPost.mockImplementation(() => Promise.resolve(DUMMY_DATA));
      const response: Response = await HttpService.root('/url-name').post({ entity: {}, headers: {}, params: {} });

      expect(response.requestSucceeded).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data.status).toBe('ok');
      expect(axiosPost).toHaveBeenCalledWith('/url-name', {}, { headers: {}, params: {} });
    });

    test('HttpService.delete handles successful requests', async () => {
      axiosDelete.mockImplementation(() => Promise.resolve({ status: 204 }));
      const response: Response = await HttpService.root('/url-name').delete({});

      expect(response.requestSucceeded).toBe(true);
      expect(response.statusCode).toBe(204);
      expect(axiosDelete).toHaveBeenCalledWith('/url-name', {
        data: undefined,
        headers: undefined,
        params: undefined,
      });
    });

    test('HttpService handles successful requests with url in the method call', async () => {
      axiosDelete.mockImplementation(() => Promise.resolve({ status: 204 }));
      const response: Response = await HttpService.delete({ url: '/url-name', entity: {}, headers: {}, params: {} });

      expect(response.requestSucceeded).toBe(true);
      expect(response.statusCode).toBe(204);
      expect(axiosDelete).toHaveBeenCalledWith('/url-name', { data: {}, headers: {}, params: {} });
    });
  });

  describe('request failure handling', () => {
    test('HttpService.get handles failed requests', async () => {
      axiosGet.mockImplementation(() => Promise.resolve(DUMMY_ERROR(404, 'Not Found')));

      const response: Response = await HttpService.root('/').get({}, () => ({}));

      expect(response.requestSucceeded).toBe(false);
      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
      expect(axiosGet).toHaveBeenCalledWith('/', { headers: undefined, params: undefined });
    });

    test('HttpService.get handles failed requests with url in the method call', async () => {
      axiosGet.mockImplementation(() => Promise.resolve(DUMMY_ERROR(404, 'Not Found')));

      const response: Response = await HttpService.get({ url: '/' }, () => ({}));

      expect(response.requestSucceeded).toBe(false);
      expect(response.statusCode).toBe(404);
      expect(response.error).toBe('Not Found');
      expect(axiosGet).toHaveBeenCalledWith('/', { headers: undefined, params: undefined });
    });

    test('HttpService.put handles failed requests', async () => {
      axiosPut.mockImplementation(() => Promise.resolve(DUMMY_ERROR()));

      const response: Response = await HttpService.root('/').put({});

      expect(response.requestSucceeded).toBe(false);
      expect(response.statusCode).toBe(500);
      expect(response.error).toBe('Dummy error');
    });

    test('HttpService.post handles failed requests', async () => {
      axiosPost.mockImplementation(() => Promise.reject(DUMMY_ERROR_EXCEPTION(400, 'Bad data')));

      const response: Response = await HttpService.root('/').post({});

      expect(response.requestSucceeded).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.error).toBe('Bad data');
    });

    test('HttpService.delete handles failed requests', async () => {
      axiosPost.mockImplementation(() => Promise.reject(DUMMY_ERROR_EXCEPTION()));

      const response: Response = await HttpService.root('/').post({});

      expect(response.requestSucceeded).toBe(false);
      expect(response.statusCode).toBe(500);
      expect(response.error).toBe('Dummy error');
    });
  });

  describe('input data handling', () => {
    test('HttpService sets search parameters correctly', async () => {
      axiosGet.mockImplementation(() => Promise.resolve(DUMMY_DATA));

      await HttpService.root('/url-name').get({ params: { query: 'value' } }, (data) => ({
        value: data?.status,
      }));

      expect(axiosGet).toHaveBeenCalledWith('/url-name', { headers: undefined, params: { query: 'value' } });
    });

    test('HttpService sets header values correctly', async () => {
      axiosGet.mockImplementation(() => Promise.resolve(DUMMY_DATA));

      await HttpService.root('/url-name').get({ headers: { auth: 'token' } }, (data) => ({
        value: data?.status,
      }));

      expect(axiosGet).toHaveBeenCalledWith('/url-name', { headers: { auth: 'token' }, params: undefined });
    });

    test('HttpService sets url replacements correctly', async () => {
      axiosGet.mockImplementation(() => Promise.resolve(DUMMY_DATA));

      await HttpService.root('/url-name/{id}').get(
        { urlReplacements: { '{id}': 'idvalue' } },
        (data) => ({ value: data?.status }),
      );

      expect(axiosGet).toHaveBeenCalledWith('/url-name/idvalue', { headers: undefined, params: undefined });
    });

    test('HttpService.{put,post} sets entity content correctly', async () => {
      axiosPost.mockImplementation(() => Promise.resolve(DUMMY_DATA));

      await HttpService.root('/url-name').post({
        entity: { key: 'value' },
        headers: {},
        params: {},
      });

      expect(axiosPost).toHaveBeenCalledWith('/url-name', { key: 'value' }, { headers: {}, params: {} });
    });
  });
});
