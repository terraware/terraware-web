import { api } from '../generated/nurseryBatches';
import { QueryTagTypes } from '../tags';

const batchMutationTags = (batchId: number) => [
  { type: QueryTagTypes.Batches, id: batchId },
  { type: QueryTagTypes.Batches, id: 'LIST' },
  { type: QueryTagTypes.NurserySummary },
  { type: QueryTagTypes.InventoryPlanning, id: 'LIST' },
];

api.enhanceEndpoints({
  endpoints: {
    getBatch: {
      providesTags: (_results, _error, batchId) => [{ type: QueryTagTypes.Batches, id: batchId }],
    },
    getBatchHistory: {
      providesTags: (_results, _error, batchId) => [{ type: QueryTagTypes.Batches, id: batchId }],
    },
    createBatch: {
      invalidatesTags: [
        { type: QueryTagTypes.Batches, id: 'LIST' },
        { type: QueryTagTypes.NurserySummary },
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
      providesTags: (_results, _error, batchId) => [{ type: QueryTagTypes.BatchPhotos, id: batchId }],
    },
    getBatchPhoto: {
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.BatchPhotos, id: payload.batchId }],
    },
    createBatchPhoto: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.BatchPhotos, id: payload.batchId },
        { type: QueryTagTypes.Batches, id: payload.batchId },
      ],
    },
    deleteBatchPhoto: {
      invalidatesTags: (_results, _error, payload) => [
        { type: QueryTagTypes.BatchPhotos, id: payload.batchId },
        { type: QueryTagTypes.Batches, id: payload.batchId },
      ],
    },
    getSeedlingBatchesUploadTemplate: {
      keepUnusedDataFor: Infinity,
    },
    uploadSeedlingBatchesList: {
      invalidatesTags: [
        { type: QueryTagTypes.Batches, id: 'LIST' },
        { type: QueryTagTypes.NurserySummary },
        { type: QueryTagTypes.InventoryPlanning, id: 'LIST' },
      ],
    },
  },
});
