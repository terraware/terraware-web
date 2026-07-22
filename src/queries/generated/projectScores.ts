import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProjectOverallScore: build.query<GetProjectOverallScoreApiResponse, GetProjectOverallScoreApiArg>({
      query: (queryArg) => ({ url: `/api/v2/accelerator/projects/${queryArg}/scores` }),
    }),
    upsertProjectScores: build.mutation<UpsertProjectScoresApiResponse, UpsertProjectScoresApiArg>({
      query: (queryArg) => ({
        url: `/api/v2/accelerator/projects/${queryArg.projectId}/scores`,
        method: 'PUT',
        body: queryArg.updateProjectOverallScoreRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetProjectOverallScoreApiResponse =
  /** status 200 The requested operation succeeded. */ GetProjectOverallScoreResponsePayload;
export type GetProjectOverallScoreApiArg = number;
export type UpsertProjectScoresApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpsertProjectScoresApiArg = {
  projectId: number;
  updateProjectOverallScoreRequestPayload: UpdateProjectOverallScoreRequestPayload;
};
export type ProjectOverallScorePayload = {
  detailsUrl?: string;
  modifiedBy?: number;
  modifiedTime?: string;
  overallScore?: number;
  summary?: string;
};
export type SuccessOrError = 'ok' | 'error';
export type GetProjectOverallScoreResponsePayload = {
  score: ProjectOverallScorePayload;
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateProjectOverallScorePayload = {
  detailsUrl?: string;
  overallScore?: number;
  summary?: string;
};
export type UpdateProjectOverallScoreRequestPayload = {
  score: UpdateProjectOverallScorePayload;
};
export const { useGetProjectOverallScoreQuery, useLazyGetProjectOverallScoreQuery, useUpsertProjectScoresMutation } =
  injectedRtkApi;
