import { DateTime } from 'luxon';

import { paths } from 'src/api/types/generated-schema';
import HttpService, { Params, Response, Response2 } from 'src/services/HttpService';
import {
  Deliverable,
  DeliverableWithOverdue,
  ListDeliverablesElement,
  ListDeliverablesElementWithOverdue,
  ListDeliverablesResponsePayload,
  UploadDeliverableDocumentRequest,
} from 'src/types/Deliverables';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { today } from 'src/utils/dateUtils';
import { SearchAndSortFn, SearchOrderConfig, searchAndSort as genericSearchAndSort } from 'src/utils/searchAndSort';

import { getPromisesResponse } from './utils';

/**
 * Accelerator "deliverable" related services
 */

const ENDPOINT_DELIVERABLES = '/api/v1/accelerator/deliverables';
const ENDPOINT_DELIVERABLE_SUBMISSION = '/api/v1/accelerator/deliverables/{deliverableId}/submissions/{projectId}';
const ENDPOINT_DELIVERABLE_SUBMISSION_SUBMIT =
  '/api/v1/accelerator/deliverables/{deliverableId}/submissions/{projectId}/submit';
const ENDPOINT_DELIVERABLE_SUBMISSION_COMPLETE =
  '/api/v1/accelerator/deliverables/{deliverableId}/submissions/{projectId}/complete';
const ENDPOINT_DELIVERABLE_SUBMISSION_INCOMPLETE =
  '/api/v1/accelerator/deliverables/{deliverableId}/submissions/{projectId}/incomplete';
const ENDPOINT_DELIVERABLE_DOCUMENT_UPLOAD = '/api/v1/accelerator/deliverables/{deliverableId}/documents';
export const ENDPOINT_DELIVERABLE_DOCUMENT = '/api/v1/accelerator/deliverables/{deliverableId}/documents/{documentId}';
const DELIVERABLES_IMPORT_ENDPOINT = '/api/v1/accelerator/deliverables/import';

export type ListDeliverablesRequestParams = paths[typeof ENDPOINT_DELIVERABLES]['get']['parameters']['query'];
export type GetDeliverableResponsePayload =
  paths[typeof ENDPOINT_DELIVERABLE_SUBMISSION]['get']['responses'][200]['content']['application/json'];

export type UpdateSubmissionRequestPayload =
  paths[typeof ENDPOINT_DELIVERABLE_SUBMISSION]['put']['requestBody']['content']['application/json'];
export type UpdateSubmissionResponsePayload =
  paths[typeof ENDPOINT_DELIVERABLE_SUBMISSION]['put']['responses'][200]['content']['application/json'];
export type SubmitSubmissionResponsePayload =
  paths[typeof ENDPOINT_DELIVERABLE_SUBMISSION_SUBMIT]['post']['responses'][200]['content']['application/json'];
export type ImportDeliverablesResponsePayload =
  paths[typeof DELIVERABLES_IMPORT_ENDPOINT]['post']['responses'][200]['content']['application/json'];

const httpDeliverables = HttpService.root(ENDPOINT_DELIVERABLES);
const httpDeliverableSubmission = HttpService.root(ENDPOINT_DELIVERABLE_SUBMISSION);
const httpDocumentUpload = HttpService.root(ENDPOINT_DELIVERABLE_DOCUMENT_UPLOAD);
const httpDeliverableSubmit = HttpService.root(ENDPOINT_DELIVERABLE_SUBMISSION_SUBMIT);
const httpDeliverableComplete = HttpService.root(ENDPOINT_DELIVERABLE_SUBMISSION_COMPLETE);
const httpDeliverableIncomplete = HttpService.root(ENDPOINT_DELIVERABLE_SUBMISSION_INCOMPLETE);

const isOverdue = (deliverable: Deliverable | ListDeliverablesElement): boolean => {
  return !!(
    deliverable.dueDate &&
    DateTime.fromISO(deliverable.dueDate) < today &&
    deliverable.status === 'Not Submitted'
  );
};

const get = async (
  deliverableId: number,
  projectId: number
): Promise<Response2<DeliverableWithOverdue | undefined>> => {
  const result = await httpDeliverableSubmission.get2<GetDeliverableResponsePayload>({
    urlReplacements: {
      '{deliverableId}': `${deliverableId}`,
      '{projectId}': `${projectId}`,
    },
  });

  if (result.requestSucceeded) {
    if (!result.data?.deliverable) {
      return { ...result, data: undefined };
    }

    const deliverable = result.data?.deliverable;
    if (isOverdue(deliverable)) {
      return { ...result, data: { ...deliverable, status: 'Overdue' } };
    } else {
      return { ...result, data: deliverable };
    }
  } else {
    return Promise.reject(result.error);
  }
};

const update = async (deliverable: Deliverable): Promise<Response> => {
  const payload: UpdateSubmissionRequestPayload = {
    status: deliverable.status,
  };
  if (deliverable.internalComment) {
    payload.internalComment = deliverable.internalComment;
  }
  if (deliverable.feedback) {
    payload.feedback = deliverable.feedback;
  }

  return httpDeliverableSubmission.put2<UpdateSubmissionResponsePayload>({
    urlReplacements: {
      '{deliverableId}': `${deliverable.id}`,
      '{projectId}': `${deliverable.projectId}`,
    },
    entity: payload,
  });
};

const list = async (
  locale: string | null,
  request?: ListDeliverablesRequestParams,
  search?: SearchNodePayload,
  searchSortOrder?: SearchSortOrder,
  searchAndSort?: SearchAndSortFn<ListDeliverablesElementWithOverdue>
): Promise<Response2<ListDeliverablesElementWithOverdue[]>> => {
  let searchOrderConfig: SearchOrderConfig | undefined;
  if (searchSortOrder) {
    searchOrderConfig = {
      locale,
      sortOrder: searchSortOrder,
      numberFields: ['id', 'numDocuments', 'organizationId', 'projectId'],
    };
  }

  const result = await httpDeliverables.get2<ListDeliverablesResponsePayload>({
    params: request as Params,
  });

  if (result.requestSucceeded) {
    const deliverablesWithOverdue = (result.data?.deliverables ?? []).map(
      (deliverable): ListDeliverablesElementWithOverdue => {
        if (isOverdue(deliverable)) {
          return { ...deliverable, status: 'Overdue' };
        } else {
          return deliverable;
        }
      }
    );

    const deliverablesResult = searchAndSort
      ? searchAndSort(deliverablesWithOverdue, search, searchOrderConfig)
      : genericSearchAndSort(deliverablesWithOverdue, search, searchOrderConfig);

    return {
      ...result,
      data: deliverablesResult,
    };
  } else {
    return Promise.reject(result.error);
  }
};

/**
 * Uploads multiple documents and waits for all promises to settle.
 */
const upload = async (
  deliverableId: number,
  documents: UploadDeliverableDocumentRequest[]
): Promise<(Response | null)[]> => {
  const headers = { 'content-type': 'multipart/form-data' };
  const urlReplacements = {
    '{deliverableId}': `${deliverableId}`,
  };
  const promises = documents.map((entity) => httpDocumentUpload.post({ urlReplacements, entity, headers }));

  return getPromisesResponse(promises);
};

/**
 * Submit a a project deliverable.
 */
const submit = async (deliverableiId: number, projectId: number): Promise<Response> => {
  return httpDeliverableSubmit.post2<UpdateSubmissionResponsePayload>({
    urlReplacements: {
      '{deliverableId}': `${deliverableiId}`,
      '{projectId}': `${projectId}`,
    },
  });
};

/**
 * Complete a a project deliverable.
 */
const complete = async (deliverableiId: number, projectId: number): Promise<Response> => {
  return httpDeliverableComplete.post2<UpdateSubmissionResponsePayload>({
    urlReplacements: {
      '{deliverableId}': `${deliverableiId}`,
      '{projectId}': `${projectId}`,
    },
  });
};

/**
 * Marks a submission from a project deliverable as incomplete
 */
const incomplete = async (deliverableiId: number, projectId: number): Promise<Response> => {
  return httpDeliverableIncomplete.post2<UpdateSubmissionResponsePayload>({
    urlReplacements: {
      '{deliverableId}': `${deliverableiId}`,
      '{projectId}': `${projectId}`,
    },
  });
};

/**
 * import deliverables
 */
const importDeliverables = async (file: File): Promise<ImportDeliverablesResponsePayload> => {
  const entity = new FormData();
  entity.append('file', file);
  const headers = { 'content-type': 'multipart/form-data' };

  const serverResponse = await HttpService.root(DELIVERABLES_IMPORT_ENDPOINT).post({
    entity,
    headers,
  });

  return serverResponse.data;
};

const DeliverablesService = {
  get,
  list,
  update,
  upload,
  submit,
  complete,
  incomplete,
  importDeliverables,
};

export default DeliverablesService;
