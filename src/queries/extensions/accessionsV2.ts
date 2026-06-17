import { api } from '../generated/accessionsV2';
import { QueryTagTypes } from '../tags';

const csvTemplateResponseHandler = async (response: Response): Promise<string> => {
  const text = await response.text();

  try {
    const parsed = JSON.parse(text);
    return typeof parsed === 'string' ? parsed : text;
  } catch {
    return text;
  }
};

api.enhanceEndpoints({
  endpoints: {
    createAccession: {
      invalidatesTags: [{ type: QueryTagTypes.Accessions, id: 'LIST' }],
    },
    getAccessionsListUploadTemplate: {
      query: () => ({
        url: '/api/v2/seedbank/accessions/uploads/template',
        headers: {
          accept: 'text/csv',
        },
        responseHandler: csvTemplateResponseHandler,
      }),
    },
    getAccession: {
      providesTags: (_results, _error, id) => [{ type: QueryTagTypes.Accessions, id }],
    },
    updateAccession: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Accessions, id: payload.id },
        { type: QueryTagTypes.Accessions, id: 'LIST' },
      ],
    },
    resolveAccessionsListUpload: {
      invalidatesTags: [{ type: QueryTagTypes.Accessions, id: 'LIST' }],
    },
    createNurseryTransferWithdrawal: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.AccessionWithdrawals, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: payload.accessionId },
      ],
    },
    listViabilityTests: {
      providesTags: (results) => [
        ...(results?.viabilityTests ?? []).map((vt) => ({ type: QueryTagTypes.ViabilityTests as const, id: vt.id })),
        { type: QueryTagTypes.ViabilityTests, id: 'LIST' },
      ],
    },
    createViabilityTest: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ViabilityTests, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: payload.accessionId },
      ],
    },
    updateViabilityTest: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ViabilityTests, id: payload.viabilityTestId },
        { type: QueryTagTypes.ViabilityTests, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: payload.accessionId },
      ],
    },
    deleteViabilityTest: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ViabilityTests, id: payload.viabilityTestId },
        { type: QueryTagTypes.ViabilityTests, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: payload.accessionId },
      ],
    },
    getViabilityTest: {
      providesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ViabilityTests, id: payload.viabilityTestId },
      ],
    },
    listWithdrawals: {
      providesTags: (results) => [
        ...(results?.withdrawals ?? []).map((w) => ({ type: QueryTagTypes.AccessionWithdrawals as const, id: w.id })),
        { type: QueryTagTypes.AccessionWithdrawals, id: 'LIST' },
      ],
    },
    createWithdrawal: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.AccessionWithdrawals, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: payload.accessionId },
      ],
    },
    updateWithdrawal: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.AccessionWithdrawals, id: payload.withdrawalId },
        { type: QueryTagTypes.AccessionWithdrawals, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: payload.accessionId },
      ],
    },
    deleteWithdrawal: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.AccessionWithdrawals, id: payload.withdrawalId },
        { type: QueryTagTypes.AccessionWithdrawals, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: payload.accessionId },
      ],
    },
    getWithdrawal: {
      providesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.AccessionWithdrawals, id: payload.withdrawalId },
      ],
    },
  },
});
