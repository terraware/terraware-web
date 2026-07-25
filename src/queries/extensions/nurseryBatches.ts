import { api } from '../generated/nurseryBatches';
import { QueryTagTypes } from '../tags';

const batchMutationTags = (batchId: number) => [
  { type: QueryTagTypes.NurseryBatches, id: batchId },
  { type: QueryTagTypes.NurseryBatches, id: 'LIST' },
  { type: QueryTagTypes.NurserySummary },
  { type: QueryTagTypes.NurserySpeciesSummary },
  { type: QueryTagTypes.NurseryOrganizationSummary },
  { type: QueryTagTypes.InventoryPlanning, id: 'LIST' },
];

api.enhanceEndpoints({
  endpoints: {
    getBatch: {
      providesTags: (_results, _error, batchId) => [{ type: QueryTagTypes.NurseryBatches, id: batchId }],
    },
    getBatchHistory: {
      providesTags: (_results, _error, batchId) => [{ type: QueryTagTypes.NurseryBatches, id: batchId }],
    },
    createBatch: {
      invalidatesTags: [
        { type: QueryTagTypes.NurseryBatches, id: 'LIST' },
        { type: QueryTagTypes.NurserySummary },
        { type: QueryTagTypes.NurserySpeciesSummary },
        { type: QueryTagTypes.NurseryOrganizationSummary },
        { type: QueryTagTypes.InventoryPlanning, id: 'LIST' },
      ],
    },
    updateBatch: {
      invalidatesTags: (_results, _error, payload) => batchMutationTags(payload.id),
    },
    updateBatchQuantities: {
      invalidatesTags: (_results, _error, payload) => batchMutationTags(payload.id),
    },
    changeBatchStatuses: {
      invalidatesTags: (_results, _error, payload) => batchMutationTags(payload.id),
    },
    deleteBatch: {
      invalidatesTags: (_results, _error, batchId) => batchMutationTags(batchId),
    },
    listBatchPhotos: {
      providesTags: (_results, _error, batchId) => [{ type: QueryTagTypes.NurseryBatchPhotos, id: batchId }],
    },
    getBatchPhoto: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.NurseryBatchPhotos, id: payload.batchId }],
    },
    createBatchPhoto: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.NurseryBatchPhotos, id: payload.batchId },
        { type: QueryTagTypes.NurseryBatches, id: payload.batchId },
      ],
    },
    deleteBatchPhoto: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.NurseryBatchPhotos, id: payload.batchId },
        { type: QueryTagTypes.NurseryBatches, id: payload.batchId },
      ],
    },
    getSeedlingBatchesUploadTemplate: {
      // The template is a static CSV file, so it is read as text and never expires
      query: () => ({ url: '/api/v1/nursery/batches/uploads/template', responseHandler: 'text' }),
      keepUnusedDataFor: Infinity,
    },
    uploadSeedlingBatchesList: {
      invalidatesTags: [
        { type: QueryTagTypes.NurseryBatches, id: 'LIST' },
        { type: QueryTagTypes.NurserySummary },
        { type: QueryTagTypes.NurserySpeciesSummary },
        { type: QueryTagTypes.NurseryOrganizationSummary },
        { type: QueryTagTypes.InventoryPlanning, id: 'LIST' },
      ],
    },
  },
});
