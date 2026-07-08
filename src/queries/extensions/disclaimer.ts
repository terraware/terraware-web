import { api } from '../generated/disclaimer';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getDisclaimer: {
      providesTags: [QueryTagTypes.Disclaimer],
      // The disclaimer rarely changes; keep it cached for the whole session and rely on the accept
      // mutation invalidating the tag to refetch when it does.
      keepUnusedDataFor: Infinity,
    },
    acceptDisclaimer: {
      invalidatesTags: [QueryTagTypes.Disclaimer],
    },
  },
});
