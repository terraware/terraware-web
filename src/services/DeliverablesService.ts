import { paths } from 'src/api/types/generated-schema';
import HttpService, { Params, Response } from 'src/services/HttpService';
import {
  Deliverable,
  DeliverableData,
  DeliverablesData,
  ListDeliverablesResponsePayload,
  UploadDeliverableDocumentRequest,
} from 'src/types/Deliverables';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

import { getPromisesResponse } from './utils';

/**
 * Accelerator "deliverable" related services
 */

const ENDPOINT_DELIVERABLES = '/api/v1/accelerator/deliverables';
const ENDPOINT_DELIVERABLE = '/api/v1/accelerator/deliverables/{deliverableId}';
const ENDPOINT_DELIVERABLE_SUBMISSION = '/api/v1/accelerator/deliverables/{deliverableId}/submissions/{projectId}';
const ENDPOINT_DELIVERABLE_DOCUMENT_UPLOAD = '/api/v1/accelerator/deliverables/{deliverableId}/documents/{projectId}';

export type ListDeliverablesRequestParams = paths[typeof ENDPOINT_DELIVERABLES]['get']['parameters']['query'];
export type GetDeliverableResponsePayload =
  paths[typeof ENDPOINT_DELIVERABLE]['get']['responses'][200]['content']['application/json'];

export type UpdateSubmissionRequestPayload =
  paths[typeof ENDPOINT_DELIVERABLE_SUBMISSION]['put']['requestBody']['content']['application/json'];
export type UpdateSubmissionResponsePayload =
  paths[typeof ENDPOINT_DELIVERABLE_SUBMISSION]['put']['responses'][200]['content']['application/json'];

const httpDeliverables = HttpService.root(ENDPOINT_DELIVERABLES);
const httpDeliverable = HttpService.root(ENDPOINT_DELIVERABLE);
const httpDeliverableSubmission = HttpService.root(ENDPOINT_DELIVERABLE_SUBMISSION);
const httpDocumentUpload = HttpService.root(ENDPOINT_DELIVERABLE_DOCUMENT_UPLOAD);

const get = async (deliverableId: number): Promise<Response & DeliverableData> =>
  httpDeliverable.get<GetDeliverableResponsePayload, DeliverableData>(
    {
      urlReplacements: { '{deliverableId}': `${deliverableId}` },
    },
    (response) => ({ deliverable: response?.deliverable })
  );

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
  searchSortOrder?: SearchSortOrder
  // TODO sort, search, etc...
): Promise<(DeliverablesData & Response) | null> => {
  let searchOrderConfig: SearchOrderConfig;
  if (searchSortOrder) {
    searchOrderConfig = {
      locale,
      sortOrder: searchSortOrder,
      numberFields: ['id', 'numDocuments', 'organizationId', 'participantId'],
    };
  }

  return httpDeliverables.get<ListDeliverablesResponsePayload, DeliverablesData>(
    {
      params: request as Params,
    },
    (data) => ({
      deliverables: searchAndSort(data?.deliverables || [], search, searchOrderConfig),
    })
  );
};

/**
 * Uploads multiple documents and waits for all promises to settle.
 */
const upload = async (deliverableId: number, documents: UploadDeliverableDocumentRequest[]): Promise<boolean> => {
  const headers = { 'content-type': 'multipart/form-data' };
  const promises = documents.map((document) => {
    const { description, file, projectId } = document;
    const urlReplacements = {
      '{deliverableId}': `${deliverableId}`,
      '{projectId}': `${projectId}`,
    };
    const entity = { description, file };

    return httpDocumentUpload.post({ urlReplacements, entity, headers });
  });

  const results = await getPromisesResponse<Response>(promises);
  return results.every((result) => result !== null && result.requestSucceeded === true);
};

const DeliverablesService = {
  get,
  list,
  update,
  upload,
};

export default DeliverablesService;
