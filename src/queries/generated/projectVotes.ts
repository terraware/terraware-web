import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    deleteProjectVotes: build.mutation<DeleteProjectVotesApiResponse, DeleteProjectVotesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/votes`,
        method: 'DELETE',
        body: queryArg.deleteProjectVotesRequestPayload,
      }),
    }),
    getProjectVotes: build.query<GetProjectVotesApiResponse, GetProjectVotesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/projects/${queryArg}/votes` }),
    }),
    upsertProjectVotes: build.mutation<UpsertProjectVotesApiResponse, UpsertProjectVotesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/projects/${queryArg.projectId}/votes`,
        method: 'PUT',
        body: queryArg.upsertProjectVotesRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type DeleteProjectVotesApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteProjectVotesApiArg = {
  projectId: number;
  deleteProjectVotesRequestPayload: DeleteProjectVotesRequestPayload;
};
export type GetProjectVotesApiResponse =
  /** status 200 The requested operation succeeded. */ GetProjectVotesResponsePayload;
export type GetProjectVotesApiArg = number;
export type UpsertProjectVotesApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpsertProjectVotesApiArg = {
  projectId: number;
  upsertProjectVotesRequestPayload: UpsertProjectVotesRequestPayload;
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
export type DeleteProjectVotesRequestPayload = {
  phase:
    | 'Phase 0 - Due Diligence'
    | 'Phase 1 - Feasibility Study'
    | 'Phase 2 - Plan and Scale'
    | 'Phase 3 - Implement and Monitor'
    | 'Pre-Screen'
    | 'Application';
  /** A safeguard flag that must be set to `true` for deleting all voters in a project phase.  */
  phaseDelete?: boolean;
  /** If set to `null`, all voters in the phase will be removed.  */
  userId?: number;
};
export type VoteSelection = {
  conditionalInfo?: string;
  /** The vote the user has selected. Can be yes/no/conditional or `null` if a vote is not yet selected. */
  email: string;
  firstName?: string;
  lastName?: string;
  userId: number;
  voteOption?: 'No' | 'Conditional' | 'Yes';
};
export type PhaseVotes = {
  decision?: 'No' | 'Conditional' | 'Yes';
  phase:
    | 'Phase 0 - Due Diligence'
    | 'Phase 1 - Feasibility Study'
    | 'Phase 2 - Plan and Scale'
    | 'Phase 3 - Implement and Monitor'
    | 'Pre-Screen'
    | 'Application';
  votes: VoteSelection[];
};
export type ProjectVotesPayload = {
  phases: PhaseVotes[];
};
export type GetProjectVotesResponsePayload = {
  status: SuccessOrError;
  votes: ProjectVotesPayload;
};
export type UpsertVoteSelection = {
  conditionalInfo?: string;
  userId: number;
  /** If set to `null`, remove the vote the user has previously selected. */
  voteOption?: 'No' | 'Conditional' | 'Yes';
};
export type UpsertProjectVotesRequestPayload = {
  phase:
    | 'Phase 0 - Due Diligence'
    | 'Phase 1 - Feasibility Study'
    | 'Phase 2 - Plan and Scale'
    | 'Phase 3 - Implement and Monitor'
    | 'Pre-Screen'
    | 'Application';
  votes: UpsertVoteSelection[];
};
export const {
  useDeleteProjectVotesMutation,
  useGetProjectVotesQuery,
  useLazyGetProjectVotesQuery,
  useUpsertProjectVotesMutation,
} = injectedRtkApi;
