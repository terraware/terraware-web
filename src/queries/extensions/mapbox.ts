import { api } from '../generated/mapbox';

// Keep the cached Mapbox token well beyond its 30 minute lifetime. The token is refetched on demand
// when Mapbox rejects it as invalid, so we don't rely on cache expiry to refresh it.
const MAPBOX_TOKEN_KEEP_UNUSED_FOR_SECONDS = 45 * 60;

api.enhanceEndpoints({
  endpoints: {
    getMapboxToken: {
      keepUnusedDataFor: MAPBOX_TOKEN_KEEP_UNUSED_FOR_SECONDS,
    },
  },
});
