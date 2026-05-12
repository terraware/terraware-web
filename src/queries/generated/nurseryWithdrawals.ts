import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    createBatchWithdrawal: build.mutation<CreateBatchWithdrawalApiResponse, CreateBatchWithdrawalApiArg>({
      query: (queryArg) => ({ url: `/api/v1/nursery/withdrawals`, method: 'POST', body: queryArg }),
    }),
    getNurseryWithdrawal: build.query<GetNurseryWithdrawalApiResponse, GetNurseryWithdrawalApiArg>({
      query: (queryArg) => ({ url: `/api/v1/nursery/withdrawals/${queryArg}` }),
    }),
    listWithdrawalPhotos: build.query<ListWithdrawalPhotosApiResponse, ListWithdrawalPhotosApiArg>({
      query: (queryArg) => ({ url: `/api/v1/nursery/withdrawals/${queryArg}/photos` }),
    }),
    uploadWithdrawalPhoto: build.mutation<UploadWithdrawalPhotoApiResponse, UploadWithdrawalPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/nursery/withdrawals/${queryArg.withdrawalId}/photos`,
        method: 'POST',
        body: queryArg.body,
      }),
    }),
    getWithdrawalPhoto: build.query<GetWithdrawalPhotoApiResponse, GetWithdrawalPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/nursery/withdrawals/${queryArg.withdrawalId}/photos/${queryArg.photoId}`,
        params: {
          maxWidth: queryArg.maxWidth,
          maxHeight: queryArg.maxHeight,
        },
      }),
    }),
    undoBatchWithdrawal: build.mutation<UndoBatchWithdrawalApiResponse, UndoBatchWithdrawalApiArg>({
      query: (queryArg) => ({ url: `/api/v1/nursery/withdrawals/${queryArg}/undo`, method: 'POST' }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type CreateBatchWithdrawalApiResponse = /** status 200 OK */ GetNurseryWithdrawalResponsePayload;
export type CreateBatchWithdrawalApiArg = CreateNurseryWithdrawalRequestPayload;
export type GetNurseryWithdrawalApiResponse = /** status 200 OK */ GetNurseryWithdrawalResponsePayload;
export type GetNurseryWithdrawalApiArg = number;
export type ListWithdrawalPhotosApiResponse = /** status 200 OK */ ListWithdrawalPhotosResponsePayload;
export type ListWithdrawalPhotosApiArg = number;
export type UploadWithdrawalPhotoApiResponse = /** status 200 OK */ CreateNurseryWithdrawalPhotoResponsePayload;
export type UploadWithdrawalPhotoApiArg = {
  withdrawalId: number;
  body: {
    file: Blob;
  };
};
export type GetWithdrawalPhotoApiResponse = /** status 200 The photo was successfully retrieved. */ Blob;
export type GetWithdrawalPhotoApiArg = {
  withdrawalId: number;
  photoId: number;
  /** Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
  maxWidth?: number;
  /** Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
  maxHeight?: number;
};
export type UndoBatchWithdrawalApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UndoBatchWithdrawalApiArg = number;
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
export type PlantingPayload = {
  id: number;
  /** If type is "Reassignment To", the reassignment notes, if any. */
  notes?: string;
  /** Number of plants planted or reassigned. If type is "Reassignment From", this will be negative. */
  numPlants: number;
  /** Use substratumId instead. */
  plantingSubzoneId?: number;
  speciesId: number;
  substratumId?: number;
  type: 'Delivery' | 'Reassignment From' | 'Reassignment To' | 'Undo';
};
export type DeliveryPayload = {
  id: number;
  plantingSiteId: number;
  plantings: PlantingPayload[];
  withdrawalId: number;
};
export type SuccessOrError = 'ok' | 'error';
export type BatchWithdrawalPayload = {
  activeGrowthQuantityWithdrawn: number;
  batchId: number;
  germinatingQuantityWithdrawn?: number;
  hardeningOffQuantityWithdrawn?: number;
  notReadyQuantityWithdrawn?: number;
  readyQuantityWithdrawn: number;
};
export type NurseryWithdrawalPayload = {
  batchWithdrawals: BatchWithdrawalPayload[];
  /** If purpose is "Nursery Transfer", the ID of the facility to which the seedlings were transferred. */
  destinationFacilityId?: number;
  facilityId: number;
  id: number;
  notes?: string;
  purpose: 'Nursery Transfer' | 'Dead' | 'Out Plant' | 'Other' | 'Undo';
  /** If purpose is "Undo", the ID of the withdrawal this one undoes. */
  undoesWithdrawalId?: number;
  /** If this withdrawal was undone, the ID of the withdrawal that undid it. */
  undoneByWithdrawalId?: number;
  withdrawnDate: string;
};
export type GetNurseryWithdrawalResponsePayload = {
  batches: BatchPayload[];
  /** If the withdrawal was an outplanting to a planting site, the delivery that was created. Not present for other withdrawal purposes. */
  delivery?: DeliveryPayload;
  status: SuccessOrError;
  withdrawal: NurseryWithdrawalPayload;
};
export type CreateNurseryWithdrawalRequestPayload = {
  batchWithdrawals: BatchWithdrawalPayload[];
  /** If purpose is "Nursery Transfer", the ID of the facility to transfer to. Must be in the same organization as the originating facility. Not allowed for purposes other than "Nursery Transfer". */
  destinationFacilityId?: number;
  facilityId: number;
  notes?: string;
  /** If purpose is "Out Plant", the ID of the planting site to which the seedlings were delivered. */
  plantingSiteId?: number;
  /** Use substratumId instead */
  plantingSubzoneId?: number;
  purpose: 'Nursery Transfer' | 'Dead' | 'Out Plant' | 'Other';
  /** If purpose is "Nursery Transfer", the estimated ready-by date to use for the batches that are created at the other nursery. */
  readyByDate?: string;
  /** If purpose is "Out Plant", the ID of the substratum to which the seedlings were delivered. Must be specified if the planting site has substrata, but must be omitted or set to null if the planting site has no substrata. */
  substratumId?: number;
  withdrawnDate: string;
};
export type CrsProperties = {
  /** Name of the coordinate reference system. This must be in the form EPSG:nnnn where nnnn is the numeric identifier of a coordinate system in the EPSG dataset. The default is Longitude/Latitude EPSG:4326, which is the coordinate system +for GeoJSON. */
  name: string;
};
export type Crs = {
  properties: CrsProperties;
  type: 'name';
};
export type GeometryBase = {
  crs?: Crs;
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon' | 'GeometryCollection';
};
export type Point = {
  type: 'Point';
} & GeometryBase & {
    /** A single position consisting of X, Y, and optional Z values in the coordinate system specified by the crs field. */
    coordinates: number[];
    type: 'Point';
  };
export type NurseryWithdrawalPhotoPayload = {
  capturedTime?: string;
  gpsCoordinates?: Point;
  id: number;
};
export type ListWithdrawalPhotosResponsePayload = {
  photos: NurseryWithdrawalPhotoPayload[];
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type CreateNurseryWithdrawalPhotoResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export const {
  useCreateBatchWithdrawalMutation,
  useGetNurseryWithdrawalQuery,
  useLazyGetNurseryWithdrawalQuery,
  useListWithdrawalPhotosQuery,
  useLazyListWithdrawalPhotosQuery,
  useUploadWithdrawalPhotoMutation,
  useGetWithdrawalPhotoQuery,
  useLazyGetWithdrawalPhotoQuery,
  useUndoBatchWithdrawalMutation,
} = injectedRtkApi;
