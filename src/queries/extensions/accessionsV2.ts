import { api } from '../generated/accessionsV2';
import { speciesCacheTags } from '../speciesCacheTags';
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
      invalidatesTags: [{ type: QueryTagTypes.Accessions, id: 'LIST' }, QueryTagTypes.SeedbankSummary],
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
      providesTags: (results, _error, id) => [
        { type: QueryTagTypes.Accessions, id },
        ...speciesCacheTags([results?.accession?.speciesId]),
      ],
    },
    updateAccession: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.Accessions, id: payload.id },
        { type: QueryTagTypes.Accessions, id: 'LIST' },
        QueryTagTypes.SeedbankSummary,
      ],
    },
    resolveAccessionsListUpload: {
      invalidatesTags: [{ type: QueryTagTypes.Accessions, id: 'LIST' }, QueryTagTypes.SeedbankSummary],
    },
    createNurseryTransferWithdrawal: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.AccessionWithdrawals, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: payload.accessionId },
        QueryTagTypes.SeedbankSummary,
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
        QueryTagTypes.SeedbankSummary,
      ],
    },
    updateViabilityTest: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ViabilityTests, id: payload.viabilityTestId },
        { type: QueryTagTypes.ViabilityTests, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: payload.accessionId },
        QueryTagTypes.SeedbankSummary,
      ],
    },
    deleteViabilityTest: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.ViabilityTests, id: payload.viabilityTestId },
        { type: QueryTagTypes.ViabilityTests, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: payload.accessionId },
        QueryTagTypes.SeedbankSummary,
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
        QueryTagTypes.SeedbankSummary,
      ],
    },
    updateWithdrawal: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.AccessionWithdrawals, id: payload.withdrawalId },
        { type: QueryTagTypes.AccessionWithdrawals, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: payload.accessionId },
        QueryTagTypes.SeedbankSummary,
      ],
    },
    deleteWithdrawal: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.AccessionWithdrawals, id: payload.withdrawalId },
        { type: QueryTagTypes.AccessionWithdrawals, id: 'LIST' },
        { type: QueryTagTypes.Accessions, id: payload.accessionId },
        QueryTagTypes.SeedbankSummary,
      ],
    },
    getWithdrawal: {
      providesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.AccessionWithdrawals, id: payload.withdrawalId },
      ],
    },
  },
});
