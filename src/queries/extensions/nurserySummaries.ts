import { api } from '../generated/nurserySummaries';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getNurserySummary: {
      providesTags: [QueryTagTypes.NurserySummary],
    },
    getSpeciesSummary: {
      providesTags: [QueryTagTypes.NurserySummary],
    },
    getOrganizationNurserySummary: {
      providesTags: [QueryTagTypes.NurserySummary],
    },
  },
});
