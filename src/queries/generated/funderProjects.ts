import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAllProjects: build.query<GetAllProjectsApiResponse, GetAllProjectsApiArg>({
      query: () => ({ url: `/api/v1/funder/projects` }),
    }),
    getProjects: build.query<GetProjectsApiResponse, GetProjectsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/funder/projects/${queryArg}` }),
    }),
    publishProjectProfile: build.mutation<PublishProjectProfileApiResponse, PublishProjectProfileApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/funder/projects/${queryArg.projectId}`,
        method: 'POST',
        body: queryArg.publishProjectProfileRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetAllProjectsApiResponse =
  /** status 200 The requested operation succeeded. */ GetPublishedProjectResponsePayload;
export type GetAllProjectsApiArg = void;
export type GetProjectsApiResponse =
  /** status 200 The requested operation succeeded. */ GetFundingProjectResponsePayload;
export type GetProjectsApiArg = number[];
export type PublishProjectProfileApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type PublishProjectProfileApiArg = {
  projectId: number;
  publishProjectProfileRequestPayload: PublishProjectProfileRequestPayload;
};
export type PublishedProjectPayload = {
  dealName?: string;
  projectId: number;
};
export type SuccessOrError = 'ok' | 'error';
export type GetPublishedProjectResponsePayload = {
  projects: PublishedProjectPayload[];
  status: SuccessOrError;
};
export type IndicatorProgressPayload = {
  indicator:
    | 'Seeds Collected'
    | 'Seedlings'
    | 'Trees Planted'
    | 'Species Planted'
    | 'Hectares Planted'
    | 'Survival Rate';
  progress: number;
};
export type FunderProjectDetailsPayload = {
  accumulationRate?: number;
  annualCarbon?: number;
  carbonCertifications: 'CCB Standard'[];
  confirmedReforestableLand?: number;
  countryAlpha3?: string;
  countryCode?: string;
  dealDescription?: string;
  dealName?: string;
  indicatorProgress?: IndicatorProgressPayload[];
  landUseModelHectares: {
    [key: string]: number;
  };
  landUseModelTypes: (
    | 'Native Forest'
    | 'Monoculture'
    | 'Sustainable Timber'
    | 'Other Timber'
    | 'Mangroves'
    | 'Agroforestry'
    | 'Silvopasture'
    | 'Other Land-Use Model'
  )[];
  methodologyNumber?: string;
  minProjectArea?: number;
  numNativeSpecies?: number;
  perHectareBudget?: number;
  projectArea?: number;
  projectHighlightPhotoValueId?: number;
  projectId: number;
  projectZoneFigureValueId?: number;
  sdgList: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17)[];
  standard?: string;
  totalExpansionPotential?: number;
  totalVCU?: number;
  verraLink?: string;
};
export type GetFundingProjectResponsePayload = {
  details?: FunderProjectDetailsPayload;
  projects: FunderProjectDetailsPayload[];
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
export type PublishProjectProfileRequestPayload = {
  details: FunderProjectDetailsPayload;
};
export const {
  useGetAllProjectsQuery,
  useLazyGetAllProjectsQuery,
  useGetProjectsQuery,
  useLazyGetProjectsQuery,
  usePublishProjectProfileMutation,
} = injectedRtkApi;
