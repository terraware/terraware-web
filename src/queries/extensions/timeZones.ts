import { api } from '../generated/timeZones';

api.enhanceEndpoints({
  endpoints: {
    // Time zone names are effectively static per locale; keep them cached for the whole session.
    listTimeZoneNames: {
      keepUnusedDataFor: Infinity,
    },
  },
});
