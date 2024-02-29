import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import {
  Deliverable,
  DeliverableData,
  DeliverablesData,
  ListDeliverablesResponsePayload,
} from 'src/types/Deliverables';
import HttpService, { Response, Params } from 'src/services/HttpService';
import { paths } from 'src/api/types/generated-schema';

/**
 * Accelerator "deliverable" related services
 */

const ENDPOINT_DELIVERABLES = '/api/v1/accelerator/deliverables';
const ENDPOINT_DELIVERABLE = '/api/v1/accelerator/deliverables/{deliverableId}';
const ENDPOINT_DELIVERABLE_SUBMISSION = '/api/v1/accelerator/deliverables/{deliverableId}/submissions/{projectId}';

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
): Promise<(DeliverablesData & Response) | null> =>
  httpDeliverables.get<ListDeliverablesResponsePayload, DeliverablesData>(
    {
      params: request as Params,
    },
    (data) => ({
      deliverables: (data?.deliverables || []).sort((a, b) => a.name.localeCompare(b.name, locale || undefined)),
    })
  );

const DeliverablesService = {
  get,
  list,
  update,
};

export default DeliverablesService;
