import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    createAccession: build.mutation<CreateAccessionApiResponse, CreateAccessionApiArg>({
      query: (queryArg) => ({ url: `/api/v2/seedbank/accessions`, method: 'POST', body: queryArg }),
    }),
    uploadAccessionsList: build.mutation<UploadAccessionsListApiResponse, UploadAccessionsListApiArg>({
      query: (queryArg) => ({
        url: `/api/v2/seedbank/accessions/uploads`,
        method: 'POST',
        body: queryArg.body,
        params: {
          facilityId: queryArg.facilityId,
        },
      }),
    }),
    getAccessionsListUploadTemplate: build.query<
      GetAccessionsListUploadTemplateApiResponse,
      GetAccessionsListUploadTemplateApiArg
    >({
      query: () => ({ url: `/api/v2/seedbank/accessions/uploads/template` }),
    }),
    deleteAccessionsListUpload: build.mutation<DeleteAccessionsListUploadApiResponse, DeleteAccessionsListUploadApiArg>(
      {
        query: (queryArg) => ({ url: `/api/v2/seedbank/accessions/uploads/${queryArg}`, method: 'DELETE' }),
      }
    ),
    getAccessionsListUploadStatus: build.query<
      GetAccessionsListUploadStatusApiResponse,
      GetAccessionsListUploadStatusApiArg
    >({
      query: (queryArg) => ({ url: `/api/v2/seedbank/accessions/uploads/${queryArg}` }),
    }),
    resolveAccessionsListUpload: build.mutation<
      ResolveAccessionsListUploadApiResponse,
      ResolveAccessionsListUploadApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v2/seedbank/accessions/uploads/${queryArg.uploadId}/resolve`,
        method: 'POST',
        body: queryArg.resolveUploadRequestPayload,
      }),
    }),
    createNurseryTransferWithdrawal: build.mutation<
      CreateNurseryTransferWithdrawalApiResponse,
      CreateNurseryTransferWithdrawalApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v2/seedbank/accessions/${queryArg.accessionId}/transfers/nursery`,
        method: 'POST',
        body: queryArg.createNurseryTransferRequestPayload,
      }),
    }),
    listViabilityTests: build.query<ListViabilityTestsApiResponse, ListViabilityTestsApiArg>({
      query: (queryArg) => ({ url: `/api/v2/seedbank/accessions/${queryArg}/viabilityTests` }),
    }),
    createViabilityTest: build.mutation<CreateViabilityTestApiResponse, CreateViabilityTestApiArg>({
      query: (queryArg) => ({
        url: `/api/v2/seedbank/accessions/${queryArg.accessionId}/viabilityTests`,
        method: 'POST',
        body: queryArg.createViabilityTestRequestPayload,
      }),
    }),
    deleteViabilityTest: build.mutation<DeleteViabilityTestApiResponse, DeleteViabilityTestApiArg>({
      query: (queryArg) => ({
        url: `/api/v2/seedbank/accessions/${queryArg.accessionId}/viabilityTests/${queryArg.viabilityTestId}`,
        method: 'DELETE',
      }),
    }),
    getViabilityTest: build.query<GetViabilityTestApiResponse, GetViabilityTestApiArg>({
      query: (queryArg) => ({
        url: `/api/v2/seedbank/accessions/${queryArg.accessionId}/viabilityTests/${queryArg.viabilityTestId}`,
      }),
    }),
    updateViabilityTest: build.mutation<UpdateViabilityTestApiResponse, UpdateViabilityTestApiArg>({
      query: (queryArg) => ({
        url: `/api/v2/seedbank/accessions/${queryArg.accessionId}/viabilityTests/${queryArg.viabilityTestId}`,
        method: 'PUT',
        body: queryArg.updateViabilityTestRequestPayload,
      }),
    }),
    listWithdrawals: build.query<ListWithdrawalsApiResponse, ListWithdrawalsApiArg>({
      query: (queryArg) => ({ url: `/api/v2/seedbank/accessions/${queryArg}/withdrawals` }),
    }),
    createWithdrawal: build.mutation<CreateWithdrawalApiResponse, CreateWithdrawalApiArg>({
      query: (queryArg) => ({
        url: `/api/v2/seedbank/accessions/${queryArg.accessionId}/withdrawals`,
        method: 'POST',
        body: queryArg.createWithdrawalRequestPayload,
      }),
    }),
    deleteWithdrawal: build.mutation<DeleteWithdrawalApiResponse, DeleteWithdrawalApiArg>({
      query: (queryArg) => ({
        url: `/api/v2/seedbank/accessions/${queryArg.accessionId}/withdrawals/${queryArg.withdrawalId}`,
        method: 'DELETE',
      }),
    }),
    getWithdrawal: build.query<GetWithdrawalApiResponse, GetWithdrawalApiArg>({
      query: (queryArg) => ({
        url: `/api/v2/seedbank/accessions/${queryArg.accessionId}/withdrawals/${queryArg.withdrawalId}`,
      }),
    }),
    updateWithdrawal: build.mutation<UpdateWithdrawalApiResponse, UpdateWithdrawalApiArg>({
      query: (queryArg) => ({
        url: `/api/v2/seedbank/accessions/${queryArg.accessionId}/withdrawals/${queryArg.withdrawalId}`,
        method: 'PUT',
        body: queryArg.updateWithdrawalRequestPayload,
      }),
    }),
    getAccession: build.query<GetAccessionApiResponse, GetAccessionApiArg>({
      query: (queryArg) => ({ url: `/api/v2/seedbank/accessions/${queryArg}` }),
    }),
    updateAccession: build.mutation<UpdateAccessionApiResponse, UpdateAccessionApiArg>({
      query: (queryArg) => ({
        url: `/api/v2/seedbank/accessions/${queryArg.id}`,
        method: 'PUT',
        body: queryArg.updateAccessionRequestPayloadV2,
        params: {
          simulate: queryArg.simulate,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type CreateAccessionApiResponse =
  /** status 200 The accession was created successfully. Response includes fields populated by the server, including the accession number and ID. */ CreateAccessionResponsePayloadV2Read;
export type CreateAccessionApiArg = CreateAccessionRequestPayloadV2Write;
export type UploadAccessionsListApiResponse =
  /** status 200 The file has been successfully received. It will be processed asynchronously; use the ID returned in the response payload to poll for its status using the `/api/v2/seedbank/accessions/uploads/{uploadId}` GET endpoint. */ UploadFileResponsePayload;
export type UploadAccessionsListApiArg = {
  facilityId: number;
  body: {
    file: Blob;
  };
};
export type GetAccessionsListUploadTemplateApiResponse = /** status 200 OK */ string;
export type GetAccessionsListUploadTemplateApiArg = void;
export type DeleteAccessionsListUploadApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteAccessionsListUploadApiArg = number;
export type GetAccessionsListUploadStatusApiResponse = /** status 200 OK */ GetUploadStatusResponsePayload;
export type GetAccessionsListUploadStatusApiArg = number;
export type ResolveAccessionsListUploadApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type ResolveAccessionsListUploadApiArg = {
  uploadId: number;
  resolveUploadRequestPayload: ResolveUploadRequestPayload;
};
export type CreateNurseryTransferWithdrawalApiResponse = /** status 200 OK */ CreateNurseryTransferResponsePayloadRead;
export type CreateNurseryTransferWithdrawalApiArg = {
  accessionId: number;
  createNurseryTransferRequestPayload: CreateNurseryTransferRequestPayload;
};
export type ListViabilityTestsApiResponse = /** status 200 OK */ ListViabilityTestsResponsePayload;
export type ListViabilityTestsApiArg = number;
export type CreateViabilityTestApiResponse = /** status 200 OK */ UpdateAccessionResponsePayloadV2Read;
export type CreateViabilityTestApiArg = {
  accessionId: number;
  createViabilityTestRequestPayload: CreateViabilityTestRequestPayload;
};
export type DeleteViabilityTestApiResponse = /** status 200 OK */ UpdateAccessionResponsePayloadV2Read;
export type DeleteViabilityTestApiArg = {
  accessionId: number;
  viabilityTestId: number;
};
export type GetViabilityTestApiResponse = /** status 200 OK */ GetViabilityTestResponsePayload;
export type GetViabilityTestApiArg = {
  accessionId: number;
  viabilityTestId: number;
};
export type UpdateViabilityTestApiResponse = /** status 200 OK */ UpdateAccessionResponsePayloadV2Read;
export type UpdateViabilityTestApiArg = {
  accessionId: number;
  viabilityTestId: number;
  updateViabilityTestRequestPayload: UpdateViabilityTestRequestPayload;
};
export type ListWithdrawalsApiResponse = /** status 200 OK */ GetWithdrawalsResponsePayloadRead;
export type ListWithdrawalsApiArg = number;
export type CreateWithdrawalApiResponse = /** status 200 OK */ UpdateAccessionResponsePayloadV2Read;
export type CreateWithdrawalApiArg = {
  accessionId: number;
  createWithdrawalRequestPayload: CreateWithdrawalRequestPayloadWrite;
};
export type DeleteWithdrawalApiResponse = /** status 200 OK */ UpdateAccessionResponsePayloadV2Read;
export type DeleteWithdrawalApiArg = {
  accessionId: number;
  withdrawalId: number;
};
export type GetWithdrawalApiResponse = /** status 200 OK */ GetWithdrawalResponsePayloadRead;
export type GetWithdrawalApiArg = {
  accessionId: number;
  withdrawalId: number;
};
export type UpdateWithdrawalApiResponse = /** status 200 OK */ UpdateAccessionResponsePayloadV2Read;
export type UpdateWithdrawalApiArg = {
  accessionId: number;
  withdrawalId: number;
  updateWithdrawalRequestPayload: UpdateWithdrawalRequestPayloadWrite;
};
export type GetAccessionApiResponse = /** status 200 OK */ GetAccessionResponsePayloadV2Read;
export type GetAccessionApiArg = number;
export type UpdateAccessionApiResponse =
  /** status 200 The accession was updated successfully. Response includes fields populated or modified by the server as a result of the update. */ UpdateAccessionResponsePayloadV2Read;
export type UpdateAccessionApiArg = {
  id: number;
  /** If true, do not actually save the accession; just return the result that would have been returned if it had been saved. */
  simulate?: boolean;
  updateAccessionRequestPayloadV2: UpdateAccessionRequestPayloadV2Write;
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
  /** Date and time the seeds were collected. */
  collectedTime?: string;
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
  /** Date and time the seeds were collected. */
  collectedTime?: string;
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
export type SuccessOrError = 'ok' | 'error';
export type CreateAccessionResponsePayloadV2 = {
  accession: AccessionPayloadV2;
  status: SuccessOrError;
};
export type CreateAccessionResponsePayloadV2Read = {
  accession: AccessionPayloadV2Read;
  status: SuccessOrError;
};
export type CreateAccessionRequestPayloadV2 = {};
export type CreateAccessionRequestPayloadV2Write = {
  bagNumbers?: string[];
  collectedDate?: string;
  /** Date and time the seeds were collected. */
  collectedTime?: string;
  collectionSiteCity?: string;
  collectionSiteCoordinates?: Geolocation[];
  collectionSiteCountryCode?: string;
  collectionSiteCountrySubdivision?: string;
  collectionSiteLandowner?: string;
  collectionSiteName?: string;
  collectionSiteNotes?: string;
  collectionSource?: 'Wild' | 'Reintroduced' | 'Cultivated' | 'Other';
  collectors?: string[];
  facilityId?: number;
  notes?: string;
  plantId?: string;
  /** Estimated number of plants the seeds were collected from. */
  plantsCollectedFrom?: number;
  projectId?: number;
  receivedDate?: string;
  source?: 'Web' | 'Seed Collector App' | 'File Import';
  speciesId?: number;
  state?: 'Awaiting Check-In' | 'Awaiting Processing' | 'Processing' | 'Drying' | 'In Storage' | 'Used Up';
  subLocation?: string;
};
export type UploadFileResponsePayload = {
  /** ID of uploaded file. This may be used to poll for the file's status. */
  id: number;
  status: SuccessOrError;
};
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
export type ResolveUploadRequestPayload = {
  /** If true, the data for entries that already exist will be overwritten with the values in the uploaded file. If false, only entries that don't already exist will be imported. */
  overwriteExisting: boolean;
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
export type CreateNurseryTransferResponsePayload = {
  /** Updated accession that includes a withdrawal for the nursery transfer. */
  accession: AccessionPayloadV2;
  /** Details of newly-created seedling batch. */
  batch: BatchPayload;
  status: SuccessOrError;
};
export type CreateNurseryTransferResponsePayloadRead = {
  /** Updated accession that includes a withdrawal for the nursery transfer. */
  accession: AccessionPayloadV2Read;
  /** Details of newly-created seedling batch. */
  batch: BatchPayload;
  status: SuccessOrError;
};
export type CreateNurseryTransferRequestPayload = {
  activeGrowthQuantity: number;
  date: string;
  destinationFacilityId: number;
  germinatingQuantity: number;
  hardeningOffQuantity?: number;
  notes?: string;
  readyByDate?: string;
  readyQuantity: number;
  /** ID of the user who withdrew the seeds. Default is the current user's ID. If non-null, the current user must have permission to read the referenced user's membership details in the organization. */
  withdrawnByUserId?: number;
};
export type ListViabilityTestsResponsePayload = {
  status: SuccessOrError;
  viabilityTests: GetViabilityTestPayload[];
};
export type UpdateAccessionResponsePayloadV2 = {
  accession: AccessionPayloadV2;
  status: SuccessOrError;
};
export type UpdateAccessionResponsePayloadV2Read = {
  accession: AccessionPayloadV2Read;
  status: SuccessOrError;
};
export type CreateViabilityTestRequestPayload = {
  endDate?: string;
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
  treatment?: 'Soak' | 'Scarify' | 'Chemical' | 'Stratification' | 'Other' | 'Light';
  /** ID of user who withdrew seeds to perform the test. Defaults to the current user. If non-null, the current user must have permission to see the referenced user's membership details in the organization. */
  withdrawnByUserId?: number;
};
export type GetViabilityTestResponsePayload = {
  status: SuccessOrError;
  viabilityTest: GetViabilityTestPayload;
};
export type UpdateViabilityTestRequestPayload = {
  endDate?: string;
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
  treatment?: 'Soak' | 'Scarify' | 'Chemical' | 'Stratification' | 'Other' | 'Light';
  /** ID of user who withdrew seeds to perform the test. If non-null, the current user must have permission to see the referenced user's membership details in the organization. If absent or null, the existing value is left unchanged. */
  withdrawnByUserId?: number;
};
export type GetWithdrawalsResponsePayload = {
  status: SuccessOrError;
  withdrawals: GetWithdrawalPayload[];
};
export type GetWithdrawalsResponsePayloadRead = {
  status: SuccessOrError;
  withdrawals: GetWithdrawalPayloadRead[];
};
export type CreateWithdrawalRequestPayload = {
  /** Quantity of seeds withdrawn. If this quantity is in weight and the remaining quantity of the accession is in seeds or vice versa, the accession must have a subset weight and count. */
  withdrawnQuantity?: SeedQuantityPayload;
};
export type CreateWithdrawalRequestPayloadRead = {
  /** Quantity of seeds withdrawn. If this quantity is in weight and the remaining quantity of the accession is in seeds or vice versa, the accession must have a subset weight and count. */
  withdrawnQuantity?: SeedQuantityPayloadRead;
};
export type CreateWithdrawalRequestPayloadWrite = {
  date?: string;
  notes?: string;
  purpose?: 'Other' | 'Viability Testing' | 'Out-planting' | 'Nursery';
  /** ID of the user who withdrew the seeds. Default is the current user's ID. If non-null, the current user must have permission to read the referenced user's membership details in the organization. */
  withdrawnByUserId?: number;
  /** Quantity of seeds withdrawn. If this quantity is in weight and the remaining quantity of the accession is in seeds or vice versa, the accession must have a subset weight and count. */
  withdrawnQuantity?: SeedQuantityPayload;
};
export type GetWithdrawalResponsePayload = {
  status: SuccessOrError;
  withdrawal: GetWithdrawalPayload;
};
export type GetWithdrawalResponsePayloadRead = {
  status: SuccessOrError;
  withdrawal: GetWithdrawalPayloadRead;
};
export type UpdateWithdrawalRequestPayload = {
  /** Quantity of seeds withdrawn. For viability testing withdrawals, this is always the same as the test's "seedsTested" value. Otherwise, it is a user-supplied value. If this quantity is in weight and the remaining quantity of the accession is in seeds or vice versa, the accession must have a subset weight and count. */
  withdrawnQuantity?: SeedQuantityPayload;
};
export type UpdateWithdrawalRequestPayloadRead = {
  /** Quantity of seeds withdrawn. For viability testing withdrawals, this is always the same as the test's "seedsTested" value. Otherwise, it is a user-supplied value. If this quantity is in weight and the remaining quantity of the accession is in seeds or vice versa, the accession must have a subset weight and count. */
  withdrawnQuantity?: SeedQuantityPayloadRead;
};
export type UpdateWithdrawalRequestPayloadWrite = {
  date?: string;
  notes?: string;
  purpose?: 'Other' | 'Viability Testing' | 'Out-planting' | 'Nursery';
  /** ID of the user who withdrew the seeds. Default is the withdrawal's existing user ID. If non-null, the current user must have permission to read the referenced user's membership details in the organization. */
  withdrawnByUserId?: number;
  /** Quantity of seeds withdrawn. For viability testing withdrawals, this is always the same as the test's "seedsTested" value. Otherwise, it is a user-supplied value. If this quantity is in weight and the remaining quantity of the accession is in seeds or vice versa, the accession must have a subset weight and count. */
  withdrawnQuantity?: SeedQuantityPayload;
};
export type GetAccessionResponsePayloadV2 = {
  accession: AccessionPayloadV2;
  status: SuccessOrError;
};
export type GetAccessionResponsePayloadV2Read = {
  accession: AccessionPayloadV2Read;
  status: SuccessOrError;
};
export type UpdateAccessionRequestPayloadV2 = {
  /** Quantity of seeds remaining in the accession. If this is different than the existing value, it is considered a new observation, and the new value will override any previously-calculated remaining quantities. */
  remainingQuantity?: SeedQuantityPayload;
  /** Weight of subset of seeds. Units must be a weight measurement, not "Seeds". */
  subsetWeight?: SeedQuantityPayload;
};
export type UpdateAccessionRequestPayloadV2Read = {
  /** Quantity of seeds remaining in the accession. If this is different than the existing value, it is considered a new observation, and the new value will override any previously-calculated remaining quantities. */
  remainingQuantity?: SeedQuantityPayloadRead;
  /** Weight of subset of seeds. Units must be a weight measurement, not "Seeds". */
  subsetWeight?: SeedQuantityPayloadRead;
};
export type UpdateAccessionRequestPayloadV2Write = {
  bagNumbers?: string[];
  collectedDate?: string;
  /** Date and time the seeds were collected. */
  collectedTime?: string;
  collectionSiteCity?: string;
  collectionSiteCoordinates?: Geolocation[];
  collectionSiteCountryCode?: string;
  collectionSiteCountrySubdivision?: string;
  collectionSiteLandowner?: string;
  collectionSiteName?: string;
  collectionSiteNotes?: string;
  collectionSource?: 'Wild' | 'Reintroduced' | 'Cultivated' | 'Other';
  collectors?: string[];
  dryingEndDate?: string;
  facilityId?: number;
  notes?: string;
  plantId?: string;
  /** Estimated number of plants the seeds were collected from. */
  plantsCollectedFrom?: number;
  projectId?: number;
  receivedDate?: string;
  /** Quantity of seeds remaining in the accession. If this is different than the existing value, it is considered a new observation, and the new value will override any previously-calculated remaining quantities. */
  remainingQuantity?: SeedQuantityPayload;
  /** Notes associated with remaining quantity updates if any. */
  remainingQuantityNotes?: string;
  speciesId?: number;
  state?: 'Awaiting Check-In' | 'Awaiting Processing' | 'Processing' | 'Drying' | 'In Storage' | 'Used Up';
  subLocation?: string;
  subsetCount?: number;
  /** Weight of subset of seeds. Units must be a weight measurement, not "Seeds". */
  subsetWeight?: SeedQuantityPayload;
  viabilityPercent?: number;
};
export const {
  useCreateAccessionMutation,
  useUploadAccessionsListMutation,
  useGetAccessionsListUploadTemplateQuery,
  useLazyGetAccessionsListUploadTemplateQuery,
  useDeleteAccessionsListUploadMutation,
  useGetAccessionsListUploadStatusQuery,
  useLazyGetAccessionsListUploadStatusQuery,
  useResolveAccessionsListUploadMutation,
  useCreateNurseryTransferWithdrawalMutation,
  useListViabilityTestsQuery,
  useLazyListViabilityTestsQuery,
  useCreateViabilityTestMutation,
  useDeleteViabilityTestMutation,
  useGetViabilityTestQuery,
  useLazyGetViabilityTestQuery,
  useUpdateViabilityTestMutation,
  useListWithdrawalsQuery,
  useLazyListWithdrawalsQuery,
  useCreateWithdrawalMutation,
  useDeleteWithdrawalMutation,
  useGetWithdrawalQuery,
  useLazyGetWithdrawalQuery,
  useUpdateWithdrawalMutation,
  useGetAccessionQuery,
  useLazyGetAccessionQuery,
  useUpdateAccessionMutation,
} = injectedRtkApi;
