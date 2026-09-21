import { MAPBOX_TOKEN_REFRESH_SECONDS } from 'src/constants';

import { api } from '../generated/mapbox';

api.enhanceEndpoints({
  endpoints: {
    getMapboxToken: {
      // Drop the cached token before it expires so a map mounting later never gets a dead token.
      keepUnusedDataFor: MAPBOX_TOKEN_REFRESH_SECONDS,
    },
  },
});
