import { api } from '../generated/clock';

api.enhanceEndpoints({
  endpoints: {
    getCurrentTime: {
      // The server clock is effectively static for a session; keep it cached indefinitely.
      keepUnusedDataFor: Infinity,
    },
  },
});
