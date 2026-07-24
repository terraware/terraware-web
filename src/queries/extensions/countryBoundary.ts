import { api } from '../generated/countryBoundary';

api.enhanceEndpoints({
  endpoints: {
    // Country boundaries are effectively static; keep them cached for the whole session.
    getBorder: {
      keepUnusedDataFor: Infinity,
    },
  },
});
