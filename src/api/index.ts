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

export default new Proxy(axios, handler);
