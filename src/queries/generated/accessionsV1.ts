import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    deleteApiV1SeedbankAccessionsById: build.mutation<
      DeleteApiV1SeedbankAccessionsByIdApiResponse,
      DeleteApiV1SeedbankAccessionsByIdApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/seedbank/accessions/${queryArg}`, method: 'DELETE' }),
    }),
    checkIn: build.mutation<CheckInApiResponse, CheckInApiArg>({
      query: (queryArg) => ({ url: `/api/v1/seedbank/accessions/${queryArg}/checkIn`, method: 'POST' }),
    }),
    getAccessionHistory: build.query<GetAccessionHistoryApiResponse, GetAccessionHistoryApiArg>({
      query: (queryArg) => ({ url: `/api/v1/seedbank/accessions/${queryArg}/history` }),
    }),
    listPhotos: build.query<ListPhotosApiResponse, ListPhotosApiArg>({
      query: (queryArg) => ({ url: `/api/v1/seedbank/accessions/${queryArg}/photos` }),
    }),
    deletePhoto: build.mutation<DeletePhotoApiResponse, DeletePhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/seedbank/accessions/${queryArg.id}/photos/${queryArg.photoFilename}`,
        method: 'DELETE',
      }),
    }),
    getPhoto: build.query<GetPhotoApiResponse, GetPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/seedbank/accessions/${queryArg.id}/photos/${queryArg.photoFilename}`,
        params: {
          maxWidth: queryArg.maxWidth,
          maxHeight: queryArg.maxHeight,
        },
      }),
    }),
    uploadPhoto: build.mutation<UploadPhotoApiResponse, UploadPhotoApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/seedbank/accessions/${queryArg.id}/photos/${queryArg.photoFilename}`,
        method: 'POST',
        body: queryArg.body,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type DeleteApiV1SeedbankAccessionsByIdApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteApiV1SeedbankAccessionsByIdApiArg = number;
export type CheckInApiResponse = /** status 200 OK */ UpdateAccessionResponsePayloadV2Read;
export type CheckInApiArg = number;
export type GetAccessionHistoryApiResponse = /** status 200 OK */ GetAccessionHistoryResponsePayload;
export type GetAccessionHistoryApiArg = number;
export type ListPhotosApiResponse =
  /** status 200 The accession's photos are listed in the response. */ ListPhotosResponsePayload;
export type ListPhotosApiArg = number;
export type DeletePhotoApiResponse = /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeletePhotoApiArg = {
  id: number;
  photoFilename: string;
};
export type GetPhotoApiResponse = /** status 200 The photo was successfully retrieved. */ Blob;
export type GetPhotoApiArg = {
  id: number;
  photoFilename: string;
  /** Maximum desired width in pixels. If neither this nor maxHeight is specified, the full-sized original image will be returned. If this is specified, an image no wider than this will be returned. The image may be narrower than this value if needed to preserve the aspect ratio of the original. */
  maxWidth?: number;
  /** Maximum desired height in pixels. If neither this nor maxWidth is specified, the full-sized original image will be returned. If this is specified, an image no taller than this will be returned. The image may be shorter than this value if needed to preserve the aspect ratio of the original. */
  maxHeight?: number;
};
export type UploadPhotoApiResponse = /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UploadPhotoApiArg = {
  id: number;
  photoFilename: string;
  body: {
    file: Blob;
  };
};
export type SuccessOrError = 'ok' | 'error';
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type Geolocation = {
  accuracy?: number;
  latitude: number;
  longitude: number;
};
export type SeedQuantityPayload = {
  /** Number of units of seeds. If "units" is "Seeds", this is the number of seeds and must be an integer. Otherwise it is a measurement in the weight units specified in the "units" field, and may have a fractional part. */
  quantity: number;
  units: 'Seeds' | 'Grams' | 'Milligrams' | 'Kilograms' | 'Ounces' | 'Pounds';
};
export type SeedQuantityPayloadRead = {
  /** If this quantity is a weight measurement, the weight in grams. This is not set if the "units" field is "Seeds". This is always calculated on the server side and is ignored on input. */
  grams?: number;
  /** Number of units of seeds. If "units" is "Seeds", this is the number of seeds and must be an integer. Otherwise it is a measurement in the weight units specified in the "units" field, and may have a fractional part. */
  quantity: number;
  units: 'Seeds' | 'Grams' | 'Milligrams' | 'Kilograms' | 'Ounces' | 'Pounds';
};
export type ViabilityTestResultPayload = {
  recordingDate: string;
  seedsGerminated: number;
};
export type GetViabilityTestPayload = {
  accessionId: number;
  endDate?: string;
  id: number;
  notes?: string;
  seedType?: 'Fresh' | 'Stored';
  seedsCompromised?: number;
  seedsEmpty?: number;
  seedsFilled?: number;
  seedsTested: number;
  startDate?: string;
  substrate?:
    | 'Nursery Media'
    | 'Agar'
    | 'Paper'
    | 'Other'
    | 'Sand'
    | 'Media Mix'
    | 'Soil'
    | 'Moss'
    | 'Perlite/Vermiculite'
    | 'None';
  testResults?: ViabilityTestResultPayload[];
  testType: 'Lab' | 'Nursery' | 'Cut';
  totalSeedsGerminated?: number;
  treatment?: 'Soak' | 'Scarify' | 'Chemical' | 'Stratification' | 'Other' | 'Light';
  /** Server-calculated viability percent for this test. For lab and nursery tests, this is based on the total seeds germinated across all test results. For cut tests, it is based on the number of seeds filled. */
  viabilityPercent?: number;
  /** Full name of user who withdrew seeds to perform the test. */
  withdrawnByName?: string;
  /** ID of user who withdrew seeds to perform the test. */
  withdrawnByUserId?: number;
};
export type GetWithdrawalPayload = {
  date: string;
  /** Number of seeds withdrawn. Calculated by server. This is an estimate if "withdrawnQuantity" is a weight quantity and the accession has subset weight and count data. Absent if "withdrawnQuantity" is a weight quantity and the accession has no subset weight and count. */
  estimatedCount?: number;
  /** Weight of seeds withdrawn. Calculated by server. This is an estimate if "withdrawnQuantity" is a seed count and the accession has subset weight and count data. Absent if "withdrawnQuantity" is a seed count and the accession has no subset weight and count. */
  estimatedWeight?: SeedQuantityPayload;
  /** Server-assigned unique ID of this withdrawal. */
  id?: number;
  notes?: string;
  purpose?: 'Other' | 'Viability Testing' | 'Out-planting' | 'Nursery';
  /** If this withdrawal is of purpose "Viability Testing", the ID of the test it is associated with. */
  viabilityTestId?: number;
  /** Full name of the person who withdrew the seeds. V1 COMPATIBILITY: This is the "staffResponsible" v1 field, which may not be the name of an organization user. */
  withdrawnByName?: string;
  /** ID of the user who withdrew the seeds. Only present if the current user has permission to list the users in the organization. V1 COMPATIBILITY: Also absent if the withdrawal was written with the v1 API and we haven't yet written the code to figure out which user ID to assign. */
  withdrawnByUserId?: number;
  /** Quantity of seeds withdrawn. For viability testing withdrawals, this is always the same as the test's "seedsTested" value. */
  withdrawnQuantity?: SeedQuantityPayload;
};
export type GetWithdrawalPayloadRead = {
  date: string;
  /** Number of seeds withdrawn. Calculated by server. This is an estimate if "withdrawnQuantity" is a weight quantity and the accession has subset weight and count data. Absent if "withdrawnQuantity" is a weight quantity and the accession has no subset weight and count. */
  estimatedCount?: number;
  /** Weight of seeds withdrawn. Calculated by server. This is an estimate if "withdrawnQuantity" is a seed count and the accession has subset weight and count data. Absent if "withdrawnQuantity" is a seed count and the accession has no subset weight and count. */
  estimatedWeight?: SeedQuantityPayloadRead;
  /** Server-assigned unique ID of this withdrawal. */
  id?: number;
  notes?: string;
  purpose?: 'Other' | 'Viability Testing' | 'Out-planting' | 'Nursery';
  /** If this withdrawal is of purpose "Viability Testing", the ID of the test it is associated with. */
  viabilityTestId?: number;
  /** Full name of the person who withdrew the seeds. V1 COMPATIBILITY: This is the "staffResponsible" v1 field, which may not be the name of an organization user. */
  withdrawnByName?: string;
  /** ID of the user who withdrew the seeds. Only present if the current user has permission to list the users in the organization. V1 COMPATIBILITY: Also absent if the withdrawal was written with the v1 API and we haven't yet written the code to figure out which user ID to assign. */
  withdrawnByUserId?: number;
  /** Quantity of seeds withdrawn. For viability testing withdrawals, this is always the same as the test's "seedsTested" value. */
  withdrawnQuantity?: SeedQuantityPayloadRead;
};
export type AccessionPayloadV2 = {
  /** Server-generated human-readable identifier for the accession. This is unique within a single seed bank, but different seed banks may have accessions with the same number. */
  accessionNumber: string;
  /** Server-calculated active indicator. This is based on the accession's state. */
  active: 'Inactive' | 'Active';
  bagNumbers?: string[];
  collectedDate?: string;
  collectionSiteCity?: string;
  collectionSiteCoordinates?: Geolocation[];
  collectionSiteCountryCode?: string;
  collectionSiteCountrySubdivision?: string;
  collectionSiteLandowner?: string;
  collectionSiteName?: string;
  collectionSiteNotes?: string;
  collectionSource?: 'Wild' | 'Reintroduced' | 'Cultivated' | 'Other';
  /** Names of the people who collected the seeds. */
  collectors?: string[];
  dryingEndDate?: string;
  /** Estimated number of seeds remaining. Absent if there isn't enough information to calculate an estimate. */
  estimatedCount?: number;
  /** Estimated weight of seeds remaining. Absent if there isn't enough information to calculate an estimate. */
  estimatedWeight?: SeedQuantityPayload;
  facilityId: number;
  /** If true, plants from this accession's seeds were delivered to a planting site. */
  hasDeliveries: boolean;
  /** Server-generated unique identifier for the accession. This is unique across all seed banks, but is not suitable for display to end users. */
  id: number;
  /** Most recent user observation of seeds remaining in the accession. This is not directly editable; it is updated by the server whenever the "remainingQuantity" field is edited. */
  latestObservedQuantity?: SeedQuantityPayload;
  /** Time of most recent user observation of seeds remaining in the accession. This is updated by the server whenever the "remainingQuantity" field is edited. */
  latestObservedTime?: string;
  notes?: string;
  photoFilenames?: string[];
  plantId?: string;
  /** Estimated number of plants the seeds were collected from. */
  plantsCollectedFrom?: number;
  projectId?: number;
  receivedDate?: string;
  /** Number or weight of seeds remaining for withdrawal and testing. May be calculated by the server after withdrawals. */
  remainingQuantity?: SeedQuantityPayload;
  /** Which source of data this accession originally came from. */
  source?: 'Web' | 'Seed Collector App' | 'File Import';
  /** Common name of the species, if defined. */
  speciesCommonName?: string;
  /** Server-generated unique ID of the species. */
  speciesId?: number;
  /** Scientific name of the species. */
  speciesScientificName?: string;
  state: 'Awaiting Check-In' | 'Awaiting Processing' | 'Processing' | 'Drying' | 'In Storage' | 'Used Up';
  subLocation?: string;
  subsetCount?: number;
  /** Weight of subset of seeds. Units must be a weight measurement, not "Seeds". */
  subsetWeight?: SeedQuantityPayload;
  /** Total number of seeds withdrawn. If withdrawals are measured by weight, this is an estimate based on the accession's subset count and weight. */
  totalWithdrawnCount?: number;
  /** Total weight of seeds withdrawn. If withdrawals are measured by seed count, this is an estimate based on the accession's subset count and weight. */
  totalWithdrawnWeight?: SeedQuantityPayload;
  viabilityPercent?: number;
  viabilityTests?: GetViabilityTestPayload[];
  withdrawals?: GetWithdrawalPayload[];
};
export type AccessionPayloadV2Read = {
  /** Server-generated human-readable identifier for the accession. This is unique within a single seed bank, but different seed banks may have accessions with the same number. */
  accessionNumber: string;
  /** Server-calculated active indicator. This is based on the accession's state. */
  active: 'Inactive' | 'Active';
  bagNumbers?: string[];
  collectedDate?: string;
  collectionSiteCity?: string;
  collectionSiteCoordinates?: Geolocation[];
  collectionSiteCountryCode?: string;
  collectionSiteCountrySubdivision?: string;
  collectionSiteLandowner?: string;
  collectionSiteName?: string;
  collectionSiteNotes?: string;
  collectionSource?: 'Wild' | 'Reintroduced' | 'Cultivated' | 'Other';
  /** Names of the people who collected the seeds. */
  collectors?: string[];
  dryingEndDate?: string;
  /** Estimated number of seeds remaining. Absent if there isn't enough information to calculate an estimate. */
  estimatedCount?: number;
  /** Estimated weight of seeds remaining. Absent if there isn't enough information to calculate an estimate. */
  estimatedWeight?: SeedQuantityPayloadRead;
  facilityId: number;
  /** If true, plants from this accession's seeds were delivered to a planting site. */
  hasDeliveries: boolean;
  /** Server-generated unique identifier for the accession. This is unique across all seed banks, but is not suitable for display to end users. */
  id: number;
  /** Most recent user observation of seeds remaining in the accession. This is not directly editable; it is updated by the server whenever the "remainingQuantity" field is edited. */
  latestObservedQuantity?: SeedQuantityPayloadRead;
  /** Time of most recent user observation of seeds remaining in the accession. This is updated by the server whenever the "remainingQuantity" field is edited. */
  latestObservedTime?: string;
  notes?: string;
  photoFilenames?: string[];
  plantId?: string;
  /** Estimated number of plants the seeds were collected from. */
  plantsCollectedFrom?: number;
  projectId?: number;
  receivedDate?: string;
  /** Number or weight of seeds remaining for withdrawal and testing. May be calculated by the server after withdrawals. */
  remainingQuantity?: SeedQuantityPayloadRead;
  /** Which source of data this accession originally came from. */
  source?: 'Web' | 'Seed Collector App' | 'File Import';
  /** Common name of the species, if defined. */
  speciesCommonName?: string;
  /** Server-generated unique ID of the species. */
  speciesId?: number;
  /** Scientific name of the species. */
  speciesScientificName?: string;
  state: 'Awaiting Check-In' | 'Awaiting Processing' | 'Processing' | 'Drying' | 'In Storage' | 'Used Up';
  subLocation?: string;
  subsetCount?: number;
  /** Weight of subset of seeds. Units must be a weight measurement, not "Seeds". */
  subsetWeight?: SeedQuantityPayloadRead;
  /** Total number of seeds withdrawn. If withdrawals are measured by weight, this is an estimate based on the accession's subset count and weight. */
  totalWithdrawnCount?: number;
  /** Total weight of seeds withdrawn. If withdrawals are measured by seed count, this is an estimate based on the accession's subset count and weight. */
  totalWithdrawnWeight?: SeedQuantityPayloadRead;
  viabilityPercent?: number;
  viabilityTests?: GetViabilityTestPayload[];
  withdrawals?: GetWithdrawalPayloadRead[];
};
export type UpdateAccessionResponsePayloadV2 = {
  accession: AccessionPayloadV2;
  status: SuccessOrError;
};
export type UpdateAccessionResponsePayloadV2Read = {
  accession: AccessionPayloadV2Read;
  status: SuccessOrError;
};
export type AccessionHistoryEntryPayload = {
  batchId?: number;
  date: string;
  /** Human-readable description of the event. Does not include date or userName. */
  description: string;
  /** Full name of the person responsible for the event, if known. */
  fullName?: string;
  /** User-entered notes about the event, if any. */
  notes?: string;
  type: 'Created' | 'QuantityUpdated' | 'StateChanged' | 'ViabilityTesting' | 'Withdrawal';
};
export type GetAccessionHistoryResponsePayload = {
  /** History of changes in descending time order (newest first.) */
  history: AccessionHistoryEntryPayload[];
  status: SuccessOrError;
};
export type ListPhotosResponseElement = {
  filename: string;
  size: number;
};
export type ListPhotosResponsePayload = {
  photos: ListPhotosResponseElement[];
  status: SuccessOrError;
};
export const {
  useDeleteApiV1SeedbankAccessionsByIdMutation,
  useCheckInMutation,
  useGetAccessionHistoryQuery,
  useLazyGetAccessionHistoryQuery,
  useListPhotosQuery,
  useLazyListPhotosQuery,
  useDeletePhotoMutation,
  useGetPhotoQuery,
  useLazyGetPhotoQuery,
  useUploadPhotoMutation,
} = injectedRtkApi;
