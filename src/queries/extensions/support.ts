import { api } from '../generated/support';

api.enhanceEndpoints({
  endpoints: {
    // Request types are effectively static; keep them cached for the whole session.
    listRequestTypes: {
      keepUnusedDataFor: Infinity,
    },
  },
});
