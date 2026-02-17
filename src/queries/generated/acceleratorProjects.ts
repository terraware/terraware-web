import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listProjectAcceleratorDetails: build.query<
      ListProjectAcceleratorDetailsApiResponse,
      ListProjectAcceleratorDetailsApiArg
    >({
      query: () => ({ url: `/api/v1/accelerator/projects` }),
    }),
    getProjectAcceleratorDetails: build.query<
      GetProjectAcceleratorDetailsApiResponse,
      GetProjectAcceleratorDetailsApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}` }),
    }),
    updateProjectAcceleratorDetails: build.mutation<
      UpdateProjectAcceleratorDetailsApiResponse,
      UpdateProjectAcceleratorDetailsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}`,
        method: 'PUT',
        body: queryArg.updateProjectAcceleratorDetailsRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListProjectAcceleratorDetailsApiResponse =
  /** status 200 The requested operation succeeded. */ ListProjectAcceleratorDetailsResponsePayload;
export type ListProjectAcceleratorDetailsApiArg = void;
export type GetProjectAcceleratorDetailsApiResponse =
  /** status 200 The requested operation succeeded. */ GetProjectAcceleratorDetailsResponsePayload;
export type GetProjectAcceleratorDetailsApiArg = number;
export type UpdateProjectAcceleratorDetailsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateProjectAcceleratorDetailsApiArg = {
  projectId: number;
  updateProjectAcceleratorDetailsRequestPayload: UpdateProjectAcceleratorDetailsRequestPayload;
};
export type MetricProgressPayload = {
  metric: 'Seeds Collected' | 'Seedlings' | 'Trees Planted' | 'Species Planted' | 'Hectares Planted' | 'Survival Rate';
  progress: number;
};
export type ProjectAcceleratorDetailsPayload = {
  accumulationRate?: number;
  annualCarbon?: number;
  applicationReforestableLand?: number;
  carbonCapacity?: number;
  carbonCertifications?: 'CCB Standard'[];
  clickUpLink?: string;
  cohortId?: number;
  cohortName?: string;
  /** Use phase instead. */
  cohortPhase?:
    | 'Phase 0 - Due Diligence'
    | 'Phase 1 - Feasibility Study'
    | 'Phase 2 - Plan and Scale'
    | 'Phase 3 - Implement and Monitor'
    | 'Pre-Screen'
    | 'Application';
  confirmedReforestableLand?: number;
  countryAlpha3?: string;
  countryCode?: string;
  dealDescription?: string;
  dealName?: string;
  dealStage?:
    | 'Phase 0 (Doc Review)'
    | 'Phase 1'
    | 'Phase 2'
    | 'Phase 3'
    | 'Graduated, Finished Planting'
    | 'Non Graduate'
    | 'Application Submitted'
    | 'Project Lead Screening Review'
    | 'Screening Questions Ready for Review'
    | 'Carbon Pre-Check'
    | 'Submission Requires Follow Up'
    | 'Carbon Eligible'
    | 'Closed Lost'
    | 'Issue Active'
    | 'Issue Pending'
    | 'Issue Reesolved';
  dropboxFolderPath?: string;
  failureRisk?: string;
  fileNaming?: string;
  gisReportsLink?: string;
  googleFolderUrl?: string;
  hubSpotUrl?: string;
  investmentThesis?: string;
  landUseModelHectares?: {
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
  maxCarbonAccumulation?: number;
  methodologyNumber?: string;
  metricProgress: MetricProgressPayload[];
  minCarbonAccumulation?: number;
  minProjectArea?: number;
  numCommunities?: number;
  numNativeSpecies?: number;
  perHectareBudget?: number;
  phase?:
    | 'Phase 0 - Due Diligence'
    | 'Phase 1 - Feasibility Study'
    | 'Phase 2 - Plan and Scale'
    | 'Phase 3 - Implement and Monitor'
    | 'Pre-Screen'
    | 'Application';
  pipeline?: 'Accelerator Projects' | 'Carbon Supply' | 'Carbon Waitlist';
  plantingSitesCql?: string;
  projectArea?: number;
  projectBoundariesCql?: string;
  projectHighlightPhotoValueId?: number;
  projectId: number;
  projectZoneFigureValueId?: number;
  region?:
    | 'Antarctica'
    | 'East Asia & Pacific'
    | 'Europe & Central Asia'
    | 'Latin America & Caribbean'
    | 'Middle East & North Africa'
    | 'North America'
    | 'Oceania'
    | 'South Asia'
    | 'Sub-Saharan Africa';
  riskTrackerLink?: string;
  sdgList?: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17)[];
  slackLink?: string;
  standard?: string;
  totalCarbon?: number;
  totalExpansionPotential?: number;
  totalVCU?: number;
  verraLink?: string;
  whatNeedsToBeTrue?: string;
};
export type SuccessOrError = 'ok' | 'error';
export type ListProjectAcceleratorDetailsResponsePayload = {
  details: ProjectAcceleratorDetailsPayload[];
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type GetProjectAcceleratorDetailsResponsePayload = {
  details: ProjectAcceleratorDetailsPayload;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateProjectAcceleratorDetailsRequestPayload = {
  accumulationRate?: number;
  annualCarbon?: number;
  applicationReforestableLand?: number;
  carbonCapacity?: number;
  carbonCertifications?: 'CCB Standard'[];
  clickUpLink?: string;
  confirmedReforestableLand?: number;
  countryCode?: string;
  dealDescription?: string;
  dealName?: string;
  dealStage?:
    | 'Phase 0 (Doc Review)'
    | 'Phase 1'
    | 'Phase 2'
    | 'Phase 3'
    | 'Graduated, Finished Planting'
    | 'Non Graduate'
    | 'Application Submitted'
    | 'Project Lead Screening Review'
    | 'Screening Questions Ready for Review'
    | 'Carbon Pre-Check'
    | 'Submission Requires Follow Up'
    | 'Carbon Eligible'
    | 'Closed Lost'
    | 'Issue Active'
    | 'Issue Pending'
    | 'Issue Reesolved';
  /** Path on Dropbox to use for sensitive document storage. Ignored if the user does not have permission to update project document settings. */
  dropboxFolderPath?: string;
  failureRisk?: string;
  fileNaming?: string;
  gisReportsLink?: string;
  /** URL of Google Drive folder to use for non-sensitive document storage. Ignored if the user does not have permission to update project document settings. */
  googleFolderUrl?: string;
  hubSpotUrl?: string;
  investmentThesis?: string;
  landUseModelHectares?: {
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
  maxCarbonAccumulation?: number;
  methodologyNumber?: string;
  minCarbonAccumulation?: number;
  minProjectArea?: number;
  numCommunities?: number;
  numNativeSpecies?: number;
  perHectareBudget?: number;
  phase?:
    | 'Phase 0 - Due Diligence'
    | 'Phase 1 - Feasibility Study'
    | 'Phase 2 - Plan and Scale'
    | 'Phase 3 - Implement and Monitor'
    | 'Pre-Screen'
    | 'Application';
  pipeline?: 'Accelerator Projects' | 'Carbon Supply' | 'Carbon Waitlist';
  projectArea?: number;
  riskTrackerLink?: string;
  sdgList?: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17)[];
  slackLink?: string;
  standard?: string;
  totalCarbon?: number;
  totalExpansionPotential?: number;
  totalVCU?: number;
  verraLink?: string;
  whatNeedsToBeTrue?: string;
};
export const {
  useListProjectAcceleratorDetailsQuery,
  useLazyListProjectAcceleratorDetailsQuery,
  useGetProjectAcceleratorDetailsQuery,
  useLazyGetProjectAcceleratorDetailsQuery,
  useUpdateProjectAcceleratorDetailsMutation,
} = injectedRtkApi;
