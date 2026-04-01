import { api } from '../generated/funderActivities';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    funderListActivities: {
      providesTags: (results) => [
        ...(results
          ? results.activities.map((activity) => ({ type: QueryTagTypes.FunderActivities, id: activity.id }))
          : []),
        { type: QueryTagTypes.FunderActivities, id: 'LIST' },
      ],
    },
  },
});
