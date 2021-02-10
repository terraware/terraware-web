/* eslint-disable no-console */
import axios from 'axios';
import delay from '../utils/delay';

let handler = {};

if (process.env.REACT_APP_DELAY_QUERIES === 'true') {
  handler = {
    get: (target: any, prop: any, receiver: any) => {
      if (!['get', 'post', 'put'].includes(prop)) {
        return Reflect.get(target, prop, receiver);
      }

      return async (...args: any[]) => (
        await delay(1500), target[prop](...args)
      );
    },
  };
}

export default new Proxy(axios, handler);
