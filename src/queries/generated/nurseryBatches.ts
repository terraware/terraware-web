import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    createBatch: build.mutation<CreateBatchApiResponse, CreateBatchApiArg>({
      query: (queryArg) => ({ url: `/api/v1/nursery/batches`, method: 'POST', body: queryArg }),
    }),
    uploadSeedlingBatchesList: build.mutation<UploadSeedlingBatchesListApiResponse, UploadSeedlingBatchesListApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/nursery/batches/uploads`,
        method: 'POST',
        body: queryArg.body,
        params: {
          facilityId: queryArg.facilityId,
        },
      }),
    }),
    getSeedlingBatchesUploadTemplate: build.query<
      GetSeedlingBatchesUploadTemplateApiResponse,
      GetSeedlingBatchesUploadTemplateApiArg
    >({
      query: () => ({ url: `/api/v1/nursery/batches/uploads/template` }),
    }),
    getSeedlingBatchesListUploadStatus: build.query<
      GetSeedlingBatchesListUploadStatusApiResponse,
      GetSeedlingBatchesListUploadStatusApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/nursery/batches/uploads/${queryArg}` }),
    }),
    getBatchHistory: build.query<GetBatchHistoryApiResponse, GetBatchHistoryApiArg>({
      query: (queryArg) => ({ url: `/api/v1/nursery/batches/${queryArg}/history` }),
    }),
    listBatchPhotos: build.query<ListBatchPhotosApiResponse, ListBatchPhotosApiArg>({
      query: (queryArg) => ({ url: `/api/v1/nursery/batches/${queryArg}/photos` }),
    }),
    createBatchPhoto: build.mutation<CreateBatchPhotoApiResponse, CreateBatchPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/nursery/batches/${queryArg.batchId}/photos`,
        method: 'POST',
        body: queryArg.body,
      }),
    }),
    deleteBatchPhoto: build.mutation<DeleteBatchPhotoApiResponse, DeleteBatchPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/nursery/batches/${queryArg.batchId}/photos/${queryArg.photoId}`,
        method: 'DELETE',
      }),
    }),
    getBatchPhoto: build.query<GetBatchPhotoApiResponse, GetBatchPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/nursery/batches/${queryArg.batchId}/photos/${queryArg.photoId}`,
        params: {
          maxWidth: queryArg.maxWidth,
          maxHeight: queryArg.maxHeight,
        },
      }),
    }),
    deleteBatch: build.mutation<DeleteBatchApiResponse, DeleteBatchApiArg>({
      query: (queryArg) => ({ url: `/api/v1/nursery/batches/${queryArg}`, method: 'DELETE' }),
    }),
    getBatch: build.query<GetBatchApiResponse, GetBatchApiArg>({
      query: (queryArg) => ({ url: `/api/v1/nursery/batches/${queryArg}` }),
    }),
    updateBatch: build.mutation<UpdateBatchApiResponse, UpdateBatchApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/nursery/batches/${queryArg.id}`,
        method: 'PUT',
        body: queryArg.updateBatchRequestPayload,
      }),
    }),
    changeBatchStatuses: build.mutation<ChangeBatchStatusesApiResponse, ChangeBatchStatusesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/nursery/batches/${queryArg.id}/changeStatuses`,
        method: 'POST',
        body: queryArg.changeBatchStatusRequestPayload,
      }),
    }),
    updateBatchQuantities: build.mutation<UpdateBatchQuantitiesApiResponse, UpdateBatchQuantitiesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/nursery/batches/${queryArg.id}/quantities`,
        method: 'PUT',
        body: queryArg.updateBatchQuantitiesRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type CreateBatchApiResponse =
  /** status 200 The batch was created successfully. Response includes fields populated by the server, including the batch ID. */ BatchResponsePayload;
export type CreateBatchApiArg = CreateBatchRequestPayload;
export type UploadSeedlingBatchesListApiResponse =
  /** status 200 The file has been successfully received. It will be processed asynchronously; use the ID returned in the response payload to poll for its status using the `/api/v1/nursery/batches/uploads/{uploadId}` GET endpoint. */ UploadFileResponsePayload;
export type UploadSeedlingBatchesListApiArg = {
  facilityId: number;
  body: {
    file: Blob;
  };
};
export type GetSeedlingBatchesUploadTemplateApiResponse = /** status 200 OK */ string;
export type GetSeedlingBatchesUploadTemplateApiArg = void;
export type GetSeedlingBatchesListUploadStatusApiResponse = /** status 200 OK */ GetUploadStatusResponsePayload;
export type GetSeedlingBatchesListUploadStatusApiArg = number;
export type GetBatchHistoryApiResponse =
  /** status 200 The requested operation succeeded. */ GetBatchHistoryResponsePayload;
export type GetBatchHistoryApiArg = number;
export type ListBatchPhotosApiResponse = /** status 200 OK */ ListBatchPhotosResponsePayload;
export type ListBatchPhotosApiArg = number;
export type CreateBatchPhotoApiResponse = /** status 200 OK */ CreateBatchPhotoResponsePayload;
export type CreateBatchPhotoApiArg = {
  batchId: number;
  body: {
    file: Blob;
  };
};
export type DeleteBatchPhotoApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteBatchPhotoApiArg = {
  batchId: number;
  photoId: number;
};
export type GetBatchPhotoApiResponse = /** status 200 The photo was successfully retrieved. */ Blob;
export type GetBatchPhotoApiArg = {
  batchId: number;
  photoId: number;
  /** Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
  maxWidth?: number;
  /** Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
  maxHeight?: number;
};
export type DeleteBatchApiResponse = /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteBatchApiArg = number;
export type GetBatchApiResponse = /** status 200 OK */ BatchResponsePayload;
export type GetBatchApiArg = number;
export type UpdateBatchApiResponse =
  /** status 200 The batch was updated successfully. Response includes fields populated or modified by the server as a result of the update. */ BatchResponsePayload;
export type UpdateBatchApiArg = {
  id: number;
  updateBatchRequestPayload: UpdateBatchRequestPayload;
};
export type ChangeBatchStatusesApiResponse = /** status 200 The requested operation succeeded. */ BatchResponsePayload;
export type ChangeBatchStatusesApiArg = {
  id: number;
  changeBatchStatusRequestPayload: ChangeBatchStatusRequestPayload;
};
export type UpdateBatchQuantitiesApiResponse =
  /** status 200 The requested operation succeeded. */ BatchResponsePayload;
export type UpdateBatchQuantitiesApiArg = {
  id: number;
  updateBatchQuantitiesRequestPayload: UpdateBatchQuantitiesRequestPayload;
};
export type BatchPayload = {
  /** If this batch was created via a seed withdrawal, the ID of the seed accession it came from. */
  accessionId?: number;
  /** If this batch was created via a seed withdrawal, the accession number associated to the seed accession it came from. */
  accessionNumber?: string;
  activeGrowthQuantity: number;
  addedDate: string;
  batchNumber: string;
  facilityId: number;
  germinatingQuantity: number;
  germinationRate?: number;
  germinationStartedDate?: string;
  hardeningOffQuantity: number;
  id: number;
  /** If this batch was created via a nursery transfer from another batch, the ID of the batch it came from. */
  initialBatchId?: number;
  latestObservedTime: string;
  lossRate?: number;
  notReadyQuantity: number;
  notes?: string;
  projectId?: number;
  readyByDate?: string;
  readyQuantity: number;
  seedsSownDate?: string;
  speciesId: number;
  subLocationIds: number[];
  substrate?: 'MediaMix' | 'Soil' | 'Sand' | 'Moss' | 'PerliteVermiculite' | 'Other';
  substrateNotes?: string;
  totalWithdrawn: number;
  treatment?: 'Soak' | 'Scarify' | 'Chemical' | 'Stratification' | 'Other' | 'Light';
  treatmentNotes?: string;
  /** Increases every time a batch is updated. Must be passed as a parameter for certain kinds of write operations to detect when a batch has changed since the client last retrieved it. */
  version: number;
};
export type SuccessOrError = 'ok' | 'error';
export type BatchResponsePayload = {
  batch: BatchPayload;
  status: SuccessOrError;
};
export type CreateBatchRequestPayload = {
  activeGrowthQuantity: number;
  addedDate: string;
  facilityId: number;
  germinatingQuantity: number;
  germinationStartedDate?: string;
  hardeningOffQuantity: number;
  notes?: string;
  projectId?: number;
  readyByDate?: string;
  readyQuantity: number;
  seedsSownDate?: string;
  speciesId: number;
  subLocationIds?: number[];
  substrate?: 'MediaMix' | 'Soil' | 'Sand' | 'Moss' | 'PerliteVermiculite' | 'Other';
  substrateNotes?: string;
  treatment?: 'Soak' | 'Scarify' | 'Chemical' | 'Stratification' | 'Other' | 'Light';
  treatmentNotes?: string;
};
export type UploadFileResponsePayload = {
  /** ID of uploaded file. This may be used to poll for the file's status. */
  id: number;
  status: SuccessOrError;
};
export type UploadProblemPayload = {
  /** Name of the field with the problem. Absent if the problem isn't specific to a single field. */
  fieldName?: string;
  /** Human-readable description of the problem. */
  message?: string;
  /** Position (row number) of the record with the problem. */
  position?: number;
  type: 'Unrecognized Value' | 'Missing Required Value' | 'Duplicate Value' | 'Malformed Value';
  /** The value that caused the problem. Absent if the problem wasn't caused by a specific field value. */
  value?: string;
};
export type GetUploadStatusDetailsPayload = {
  errors?: UploadProblemPayload[];
  /** True if the server is finished processing the file, either successfully or not. */
  finished: boolean;
  id: number;
  status:
    | 'Receiving'
    | 'Validating'
    | 'Processing'
    | 'Completed'
    | 'Processing Failed'
    | 'Invalid'
    | 'Receiving Failed'
    | 'Awaiting Validation'
    | 'Awaiting User Action'
    | 'Awaiting Processing';
  warnings?: UploadProblemPayload[];
};
export type GetUploadStatusResponsePayload = {
  details: GetUploadStatusDetailsPayload;
  status: SuccessOrError;
};
export type BatchHistoryPayloadCommonProps = {
  createdBy: number;
  createdTime: string;
  version?: number;
};
export type BatchHistorySubLocationPayload = {
  /** The ID of the sub-location if it still exists. If it was subsequently deleted, this will be null but the name will still be present. */
  id?: number;
  /** The name of the sub-location at the time the details were edited. If the sub-location was subsequently renamed or deleted, this name remains the same. */
  name: string;
};
export type BatchHistoryDetailsEditedPayload = BatchHistoryPayloadCommonProps & {
  germinationStartedDate?: string;
  notes?: string;
  /** The ID of the batch's project if the project still exists. If the project was subsequently deleted, this will be null but the project name will still be set. */
  projectId?: number;
  /** The name of the project at the time the details were edited. If the project was subsequently renamed or deleted, this name remains the same. */
  projectName?: string;
  readyByDate?: string;
  seedsSownDate?: string;
  subLocations: BatchHistorySubLocationPayload[];
  substrate?: 'MediaMix' | 'Soil' | 'Sand' | 'Moss' | 'PerliteVermiculite' | 'Other';
  substrateNotes?: string;
  treatment?: 'Soak' | 'Scarify' | 'Chemical' | 'Stratification' | 'Other' | 'Light';
  treatmentNotes?: string;
  type: 'DetailsEdited';
};
export type BatchHistoryIncomingWithdrawalPayload = BatchHistoryPayloadCommonProps & {
  activeGrowthQuantityAdded: number;
  fromBatchId: number;
  germinatingQuantityAdded: number;
  hardeningOffQuantityAdded: number;
  notReadyQuantityAdded: number;
  readyQuantityAdded: number;
  type: 'IncomingWithdrawal';
  withdrawalId: number;
  withdrawnDate: string;
};
export type BatchHistoryOutgoingWithdrawalPayload = BatchHistoryPayloadCommonProps & {
  activeGrowthQuantityWithdrawn: number;
  germinatingQuantityWithdrawn: number;
  hardeningOffQuantity: number;
  notReadyQuantityWithdrawn: number;
  purpose: 'Nursery Transfer' | 'Dead' | 'Out Plant' | 'Other' | 'Undo';
  readyQuantityWithdrawn: number;
  type: 'OutgoingWithdrawal';
  withdrawalId: number;
  withdrawnDate: string;
};
export type BatchHistoryPhotoCreatedPayload = BatchHistoryPayloadCommonProps & {
  /** ID of the photo if it exists. Null if the photo has been deleted. */
  fileId?: number;
  type: 'PhotoCreated';
};
export type BatchHistoryPhotoDeletedPayload = BatchHistoryPayloadCommonProps & {
  type: 'PhotoDeleted';
};
export type BatchHistoryQuantityEditedPayload = BatchHistoryPayloadCommonProps & {
  activeGrowthQuantity: number;
  germinatingQuantity: number;
  hardeningOffQuantity: number;
  notReadyQuantity: number;
  notes?: string;
  readyQuantity: number;
  type: 'QuantityEdited';
};
export type BatchHistoryStatusChangedPayload = BatchHistoryPayloadCommonProps & {
  activeGrowthQuantity: number;
  germinatingQuantity: number;
  hardeningOffQuantity: number;
  notReadyQuantity: number;
  readyQuantity: number;
  type: 'StatusChanged';
};
export type BatchHistoryPayload =
  | ({
      type: 'DetailsEdited';
    } & BatchHistoryDetailsEditedPayload)
  | ({
      type: 'IncomingWithdrawal';
    } & BatchHistoryIncomingWithdrawalPayload)
  | ({
      type: 'OutgoingWithdrawal';
    } & BatchHistoryOutgoingWithdrawalPayload)
  | ({
      type: 'PhotoCreated';
    } & BatchHistoryPhotoCreatedPayload)
  | ({
      type: 'PhotoDeleted';
    } & BatchHistoryPhotoDeletedPayload)
  | ({
      type: 'QuantityEdited';
    } & BatchHistoryQuantityEditedPayload)
  | ({
      type: 'StatusChanged';
    } & BatchHistoryStatusChangedPayload);
export type GetBatchHistoryResponsePayload = {
  history: BatchHistoryPayload[];
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type BatchPhotoPayload = {
  id: number;
};
export type ListBatchPhotosResponsePayload = {
  photos: BatchPhotoPayload[];
  status: SuccessOrError;
};
export type CreateBatchPhotoResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateBatchRequestPayload = {
  germinationStartedDate?: string;
  notes?: string;
  projectId?: number;
  readyByDate?: string;
  seedsSownDate?: string;
  subLocationIds?: number[];
  substrate?: 'MediaMix' | 'Soil' | 'Sand' | 'Moss' | 'PerliteVermiculite' | 'Other';
  substrateNotes?: string;
  treatment?: 'Soak' | 'Scarify' | 'Chemical' | 'Stratification' | 'Other' | 'Light';
  treatmentNotes?: string;
  version: number;
};
export type ChangeBatchStatusRequestPayload = {
  /** Which status to move seedlings to. */
  newPhase?: 'Germinating' | 'ActiveGrowth' | 'NotReady' | 'HardeningOff' | 'Ready';
  /** Which status change to apply. */
  operation?: 'GerminatingToNotReady' | 'NotReadyToReady';
  /** Which status to move seedlings from. */
  previousPhase?: 'Germinating' | 'ActiveGrowth' | 'NotReady' | 'HardeningOff' | 'Ready';
  /** Number of seedlings to move from one status to the next. */
  quantity: number;
};
export type UpdateBatchQuantitiesRequestPayload = {
  activeGrowthQuantity: number;
  germinatingQuantity: number;
  hardeningOffQuantity?: number;
  notes?: string;
  readyQuantity: number;
  version: number;
};
export const {
  useCreateBatchMutation,
  useUploadSeedlingBatchesListMutation,
  useGetSeedlingBatchesUploadTemplateQuery,
  useLazyGetSeedlingBatchesUploadTemplateQuery,
  useGetSeedlingBatchesListUploadStatusQuery,
  useLazyGetSeedlingBatchesListUploadStatusQuery,
  useGetBatchHistoryQuery,
  useLazyGetBatchHistoryQuery,
  useListBatchPhotosQuery,
  useLazyListBatchPhotosQuery,
  useCreateBatchPhotoMutation,
  useDeleteBatchPhotoMutation,
  useGetBatchPhotoQuery,
  useLazyGetBatchPhotoQuery,
  useDeleteBatchMutation,
  useGetBatchQuery,
  useLazyGetBatchQuery,
  useUpdateBatchMutation,
  useChangeBatchStatusesMutation,
  useUpdateBatchQuantitiesMutation,
} = injectedRtkApi;
