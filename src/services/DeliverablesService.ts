import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import {
  Deliverable,
  DeliverableData,
  DeliverablesData,
  ListDeliverablesResponsePayload,
  UpdateRequest,
} from 'src/types/Deliverables';
import HttpService, { Response, Params } from 'src/services/HttpService';
import { paths } from 'src/api/types/generated-schema';

/**
 * Accelerator "deliverable" related services
 */

const ENDPOINT_LIST_DELIVERABLES = '/api/v1/accelerator/deliverables';
const ENDPOINT_GET_DELIVERABLE = '/api/v1/accelerator/deliverables/{deliverableId}';

export type ListDeliverablesRequestParams = paths[typeof ENDPOINT_LIST_DELIVERABLES]['get']['parameters']['query'];
export type GetDeliverableResponsePayload =
  paths[typeof ENDPOINT_GET_DELIVERABLE]['get']['responses'][200]['content']['application/json'];

const httpDeliverables = HttpService.root(ENDPOINT_LIST_DELIVERABLES);

// TODO remove this when we replace the update
let mockDeliverable: Deliverable;

const getDeliverable = async (deliverableId: number): Promise<Response & DeliverableData> =>
  httpDeliverables.get<GetDeliverableResponsePayload, DeliverableData>(
    {
      url: ENDPOINT_GET_DELIVERABLE,
      urlReplacements: { '{deliverableId}': `${deliverableId}` },
    },
    (response) => ({ deliverable: response?.deliverable })
  );

const update = async ({ internalComment, reason, status }: UpdateRequest): Promise<Response> => {
  if (status) {
    mockDeliverable.status = status;
  }

  mockDeliverable.feedback = reason;
  mockDeliverable.internalComment = internalComment;
  return { requestSucceeded: true };
};

const listDeliverables = async (
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
  getDeliverable,
  listDeliverables,
  update,
};

export default DeliverablesService;
