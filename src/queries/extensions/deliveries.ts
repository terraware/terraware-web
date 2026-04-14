import { api } from '../generated/deliveries';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getDelivery: {
      providesTags: (_result, _error, deliveryId) => [{ type: QueryTagTypes.AcceleratorProjects, id: deliveryId }],
    },
    reassignDelivery: {
      invalidatesTags: (_result, _error, payload) => [
        { type: QueryTagTypes.AcceleratorProjects, id: payload.id },
      ],
    },
  },
});
