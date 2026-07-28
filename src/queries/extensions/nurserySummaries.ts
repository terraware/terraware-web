import { api } from '../generated/nurserySummaries';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getNurserySummary: {
      providesTags: (_results, _error, facilityId) => [{ type: QueryTagTypes.NurserySummary, id: facilityId }],
    },
    getSpeciesSummary: {
      providesTags: (_results, _error, speciesId) => [{ type: QueryTagTypes.NurserySpeciesSummary, id: speciesId }],
    },
    getOrganizationNurserySummary: {
      providesTags: (_results, _error, organizationId) => [
        { type: QueryTagTypes.NurseryOrganizationSummary, id: organizationId },
      ],
    },
  },
});
