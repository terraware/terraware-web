import { api } from '../generated/facilities';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    createFacility: {
      invalidatesTags: [{ type: QueryTagTypes.Organizations, id: 'LIST' }],
    },
    updateFacility: {
      invalidatesTags: [{ type: QueryTagTypes.Organizations, id: 'LIST' }],
    },
    listSubLocations: {
      providesTags: (_result, _error, facilityId) => [{ type: QueryTagTypes.SubLocations, id: facilityId }],
    },
    createSubLocation: {
      invalidatesTags: (_result, _error, arg) => [{ type: QueryTagTypes.SubLocations, id: arg.facilityId }],
    },
    updateSubLocation: {
      invalidatesTags: (_result, _error, arg) => [{ type: QueryTagTypes.SubLocations, id: arg.facilityId }],
    },
    deleteSubLocation: {
      invalidatesTags: (_result, _error, arg) => [{ type: QueryTagTypes.SubLocations, id: arg.facilityId }],
    },
  },
});
