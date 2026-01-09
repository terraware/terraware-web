import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listModules: build.query<ListModulesApiResponse, ListModulesApiArg>({
      query: () => ({ url: `/api/v1/accelerator/modules` }),
    }),
    importModules: build.mutation<ImportModulesApiResponse, ImportModulesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/modules/import`, method: 'POST', body: queryArg }),
    }),
    getModule: build.query<GetModuleApiResponse, GetModuleApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/modules/${queryArg}` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListModulesApiResponse = /** status 200 The requested operation succeeded. */ ListModulesResponsePayload;
export type ListModulesApiArg = void;
export type ImportModulesApiResponse = /** status 200 The requested operation succeeded. */ ImportModuleResponsePayload;
export type ImportModulesApiArg = {
  file: Blob;
};
export type GetModuleApiResponse = /** status 200 The requested operation succeeded. */ GetModuleResponsePayload;
export type GetModuleApiArg = number;
export type ModuleDeliverablePayload = {
  category:
    | 'Compliance'
    | 'Financial Viability'
    | 'GIS'
    | 'Carbon Eligibility'
    | 'Stakeholders and Community Impact'
    | 'Proposed Restoration Activities'
    | 'Verra Non-Permanence Risk Tool (NPRT)'
    | 'Supplemental Files';
  /** Optional description of the deliverable in HTML form. */
  descriptionHtml?: string;
  id: number;
  name: string;
  position: number;
  required: boolean;
  sensitive: boolean;
  type: 'Document' | 'Species' | 'Questions';
};
export type ModulePayload = {
  additionalResources?: string;
  deliverables: ModuleDeliverablePayload[];
  eventDescriptions: {
    [key: string]: string;
  };
  id: number;
  name: string;
  overview?: string;
  preparationMaterials?: string;
};
export type SuccessOrError = 'ok' | 'error';
export type ListModulesResponsePayload = {
  modules: ModulePayload[];
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type ImportModuleProblemElement = {
  problem: string;
  row: number;
};
export type ImportModuleResponsePayload = {
  message?: string;
  problems: ImportModuleProblemElement[];
  status: SuccessOrError;
};
export type GetModuleResponsePayload = {
  module: ModulePayload;
  status: SuccessOrError;
};
export const {
  useListModulesQuery,
  useLazyListModulesQuery,
  useImportModulesMutation,
  useGetModuleQuery,
  useLazyGetModuleQuery,
} = injectedRtkApi;
