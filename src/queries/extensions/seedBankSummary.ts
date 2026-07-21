import { api } from '../generated/seedBankSummary';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getSeedBankSummary: {
      providesTags: [QueryTagTypes.Accessions],
    },
  },
});
