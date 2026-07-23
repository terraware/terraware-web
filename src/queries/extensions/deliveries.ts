import { api } from '../generated/deliveries';
import { speciesCacheTags } from '../speciesCacheTags';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getDelivery: {
      providesTags: (result, _error, deliveryId) => [
        { type: QueryTagTypes.AcceleratorProjects, id: deliveryId },
        ...speciesCacheTags((result?.delivery?.plantings ?? []).map((planting) => planting.speciesId)),
      ],
    },
    reassignDelivery: {
      invalidatesTags: (_result, _error, payload) => [{ type: QueryTagTypes.AcceleratorProjects, id: payload.id }],
    },
  },
});
