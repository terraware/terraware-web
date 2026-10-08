import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listDeliverables: build.query<ListDeliverablesApiResponse, ListDeliverablesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/deliverables`,
        params: {
          moduleId: queryArg.moduleId,
          organizationId: queryArg.organizationId,
          projectId: queryArg.projectId,
        },
      }),
    }),
    importDeliverables: build.mutation<ImportDeliverablesApiResponse, ImportDeliverablesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/deliverables/import`, method: 'POST', body: queryArg }),
    }),
    uploadDeliverableDocument: build.mutation<UploadDeliverableDocumentApiResponse, UploadDeliverableDocumentApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/deliverables/${queryArg.deliverableId}/documents`,
        method: 'POST',
        body: queryArg.body,
      }),
    }),
    getDeliverableDocument: build.query<GetDeliverableDocumentApiResponse, GetDeliverableDocumentApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/deliverables/${queryArg.deliverableId}/documents/${queryArg.documentId}`,
      }),
    }),
    getDeliverable: build.query<GetDeliverableApiResponse, GetDeliverableApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/deliverables/${queryArg.deliverableId}/submissions/${queryArg.projectId}`,
      }),
    }),
    updateSubmission: build.mutation<UpdateSubmissionApiResponse, UpdateSubmissionApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/deliverables/${queryArg.deliverableId}/submissions/${queryArg.projectId}`,
        method: 'PUT',
        body: queryArg.updateSubmissionRequestPayload,
      }),
    }),
    completeSubmission: build.mutation<CompleteSubmissionApiResponse, CompleteSubmissionApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/deliverables/${queryArg.deliverableId}/submissions/${queryArg.projectId}/complete`,
        method: 'POST',
      }),
    }),
    incompleteSubmission: build.mutation<IncompleteSubmissionApiResponse, IncompleteSubmissionApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/deliverables/${queryArg.deliverableId}/submissions/${queryArg.projectId}/incomplete`,
        method: 'POST',
      }),
    }),
    submitSubmission: build.mutation<SubmitSubmissionApiResponse, SubmitSubmissionApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/deliverables/${queryArg.deliverableId}/submissions/${queryArg.projectId}/submit`,
        method: 'POST',
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListDeliverablesApiResponse =
  /** status 200 The requested operation succeeded. */ ListDeliverablesResponsePayload;
export type ListDeliverablesApiArg = {
  /** Filter deliverables by modules. Can be used with other request params. */
  moduleId?: number;
  /** List deliverables for projects belonging to this organization. Ignored if participantId or projectId is specified. */
  organizationId?: number;
  /** List deliverables for this project only. */
  projectId?: number;
};
export type ImportDeliverablesApiResponse =
  /** status 200 The requested operation succeeded. */ ImportDeliverableResponsePayload;
export type ImportDeliverablesApiArg = {
  file: Blob;
};
export type UploadDeliverableDocumentApiResponse =
  /** status 200 The requested operation succeeded. */ UploadDeliverableDocumentResponsePayload;
export type UploadDeliverableDocumentApiArg = {
  deliverableId: number;
  body: {
    description: string;
    file: Blob;
    projectId: string;
  };
};
export type GetDeliverableDocumentApiResponse = unknown;
export type GetDeliverableDocumentApiArg = {
  deliverableId: number;
  documentId: number;
};
export type GetDeliverableApiResponse =
  /** status 200 The requested operation succeeded. */ GetDeliverableResponsePayload;
export type GetDeliverableApiArg = {
  deliverableId: number;
  projectId: number;
};
export type UpdateSubmissionApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateSubmissionApiArg = {
  deliverableId: number;
  projectId: number;
  updateSubmissionRequestPayload: UpdateSubmissionRequestPayload;
};
export type CompleteSubmissionApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type CompleteSubmissionApiArg = {
  deliverableId: number;
  projectId: number;
};
export type IncompleteSubmissionApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type IncompleteSubmissionApiArg = {
  deliverableId: number;
  projectId: number;
};
export type SubmitSubmissionApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type SubmitSubmissionApiArg = {
  deliverableId: number;
  projectId: number;
};
export type ListDeliverablesElement = {
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
  dueDate?: string;
  id: number;
  moduleId: number;
  moduleName: string;
  moduleTitle?: string;
  name: string;
  /** Number of documents submitted for this deliverable. Only valid for deliverables of type Document. */
  numDocuments?: number;
  organizationId: number;
  organizationName: string;
  position: number;
  projectDealName?: string;
  projectId: number;
  projectName: string;
  required: boolean;
  sensitive: boolean;
  status: 'Not Submitted' | 'In Review' | 'Needs Translation' | 'Approved' | 'Rejected' | 'Not Needed' | 'Completed';
  type: 'Document' | 'Species' | 'Questions';
};
export type SuccessOrError = 'ok' | 'error';
export type ListDeliverablesResponsePayload = {
  deliverables: ListDeliverablesElement[];
  status: SuccessOrError;
};
export type ImportDeliverableProblemElement = {
  problem: string;
  row: number;
};
export type ImportDeliverableResponsePayload = {
  message?: string;
  problems: ImportDeliverableProblemElement[];
  status: SuccessOrError;
};
export type UploadDeliverableDocumentResponsePayload = {
  documentId: number;
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type SubmissionDocumentPayload = {
  createdTime: string;
  description?: string;
  documentStore: 'Dropbox' | 'Google' | 'External';
  id: number;
  name: string;
  originalName?: string;
};
export type DeliverablePayload = {
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
  documents: SubmissionDocumentPayload[];
  /** If the deliverable has been reviewed, the user-visible feedback from the review. */
  dueDate?: string;
  feedback?: string;
  id: number;
  /** Internal-only comment on the submission. Only present if the current user has accelerator admin privileges. */
  internalComment?: string;
  name: string;
  organizationId: number;
  organizationName: string;
  position: number;
  projectDealName?: string;
  projectId: number;
  projectName: string;
  required: boolean;
  sensitive: boolean;
  status: 'Not Submitted' | 'In Review' | 'Needs Translation' | 'Approved' | 'Rejected' | 'Not Needed' | 'Completed';
  templateUrl?: string;
  type: 'Document' | 'Species' | 'Questions';
};
export type GetDeliverableResponsePayload = {
  deliverable: DeliverablePayload;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateSubmissionRequestPayload = {
  feedback?: string;
  internalComment?: string;
  status: 'Not Submitted' | 'In Review' | 'Needs Translation' | 'Approved' | 'Rejected' | 'Not Needed' | 'Completed';
};
export const {
  useListDeliverablesQuery,
  useLazyListDeliverablesQuery,
  useImportDeliverablesMutation,
  useUploadDeliverableDocumentMutation,
  useGetDeliverableDocumentQuery,
  useLazyGetDeliverableDocumentQuery,
  useGetDeliverableQuery,
  useLazyGetDeliverableQuery,
  useUpdateSubmissionMutation,
  useCompleteSubmissionMutation,
  useIncompleteSubmissionMutation,
  useSubmitSubmissionMutation,
} = injectedRtkApi;
