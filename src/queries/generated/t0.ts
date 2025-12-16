import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    assignT0SiteData: build.mutation<AssignT0SiteDataApiResponse, AssignT0SiteDataApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/t0/site`, method: 'POST', body: queryArg }),
    }),
    assignT0TempSiteData: build.mutation<AssignT0TempSiteDataApiResponse, AssignT0TempSiteDataApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/t0/site/temp`, method: 'POST', body: queryArg }),
    }),
    getT0SiteData: build.query<GetT0SiteDataApiResponse, GetT0SiteDataApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/t0/site/${queryArg}` }),
    }),
    getAllT0SiteDataSet: build.query<GetAllT0SiteDataSetApiResponse, GetAllT0SiteDataSetApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/t0/site/${queryArg}/allSet` }),
    }),
    getT0SpeciesForPlantingSite: build.query<GetT0SpeciesForPlantingSiteApiResponse, GetT0SpeciesForPlantingSiteApiArg>(
      {
        query: (queryArg) => ({ url: `/api/v1/tracking/t0/site/${queryArg}/species` }),
      }
    ),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type AssignT0SiteDataApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type AssignT0SiteDataApiArg = AssignSiteT0DataRequestPayload;
export type AssignT0TempSiteDataApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type AssignT0TempSiteDataApiArg = AssignSiteT0TempDataRequestPayload;
export type GetT0SiteDataApiResponse = /** status 200 OK */ GetSiteT0DataResponsePayload;
export type GetT0SiteDataApiArg = number;
export type GetAllT0SiteDataSetApiResponse = /** status 200 OK */ GetAllSiteT0DataSetResponsePayload;
export type GetAllT0SiteDataSetApiArg = number;
export type GetT0SpeciesForPlantingSiteApiResponse = /** status 200 OK */ GetSitePlotSpeciesResponsePayload;
export type GetT0SpeciesForPlantingSiteApiArg = number;
export type SuccessOrError = 'ok' | 'error';
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type SpeciesDensityPayload = {
  density: number;
  plotDensity: number;
  speciesId: number;
};
export type PlotT0DataPayload = {
  densityData: SpeciesDensityPayload[];
  monitoringPlotId: number;
  observationId?: number;
};
export type AssignSiteT0DataRequestPayload = {
  plantingSiteId: number;
  plots: PlotT0DataPayload[];
};
export type ZoneT0DataPayload = {
  densityData: SpeciesDensityPayload[];
  plantingZoneId: number;
};
export type AssignSiteT0TempDataRequestPayload = {
  plantingSiteId: number;
  zones: ZoneT0DataPayload[];
};
export type SiteT0DataResponsePayload = {
  plantingSiteId: number;
  plots: PlotT0DataPayload[];
  survivalRateIncludesTempPlots: boolean;
  zones: ZoneT0DataPayload[];
};
export type GetSiteT0DataResponsePayload = {
  data: SiteT0DataResponsePayload;
  status: SuccessOrError;
};
export type GetAllSiteT0DataSetResponsePayload = {
  allSet: boolean;
  status: SuccessOrError;
};
export type OptionalSpeciesDensityPayload = {
  density?: number;
  speciesId: number;
};
export type PlotSpeciesDensitiesPayload = {
  monitoringPlotId: number;
  species: OptionalSpeciesDensityPayload[];
};
export type GetSitePlotSpeciesResponsePayload = {
  plots: PlotSpeciesDensitiesPayload[];
  status: SuccessOrError;
};
export const {
  useAssignT0SiteDataMutation,
  useAssignT0TempSiteDataMutation,
  useGetT0SiteDataQuery,
  useLazyGetT0SiteDataQuery,
  useGetAllT0SiteDataSetQuery,
  useLazyGetAllT0SiteDataSetQuery,
  useGetT0SpeciesForPlantingSiteQuery,
  useLazyGetT0SpeciesForPlantingSiteQuery,
} = injectedRtkApi;
