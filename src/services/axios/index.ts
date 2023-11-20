import axios from 'axios';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

let handler = {};

if (process.env.REACT_APP_DELAY_QUERIES === 'true') {
  handler = {
    get: (target: any, prop: any, receiver: any) => {
      if (!['get', 'post', 'put'].includes(prop)) {
        return Reflect.get(target, prop, receiver);
      }

      return async (...args: any[]) => (
        // eslint-disable-next-line no-sequences
        await delay(1500), target[prop](...args)
      );
    },
  };
}

axios.defaults.withCredentials = true;

/*eslint no-restricted-globals: ["off", "location"]*/
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const href = location.href.match('/error') ? location.origin : location.href;
      const redirect = encodeURIComponent(href);
      location.href = `/api/v1/login?redirect=${redirect}`;
    }
    return Promise.reject(error);
  }
);

axios.interceptors.request.use((x) => {
  // @ts-ignore
  x.meta = x.meta || {};
  // @ts-ignore
  x.meta.beginTimer = new Date().getTime();
  return x;
});

axios.interceptors.response.use((x) => {
  // @ts-ignore
  x.responseTime = new Date().getTime() - x.config.meta.beginTimer;
  return x;
});

const proxy = new Proxy(axios, handler);

export type { AxiosResponse } from 'axios';
export default proxy;
