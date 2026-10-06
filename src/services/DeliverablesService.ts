import { paths } from 'src/api/types/generated-schema';
import HttpService, { Params, Response2 } from 'src/services/HttpService';
import { ListDeliverablesElementWithOverdue, withOverdueStatus } from 'src/types/Deliverables';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchAndSortFn, SearchOrderConfig, searchAndSort as genericSearchAndSort } from 'src/utils/searchAndSort';

const ENDPOINT_DELIVERABLES = '/api/v1/accelerator/deliverables';

type ListDeliverablesResponsePayload =
  paths[typeof ENDPOINT_DELIVERABLES]['get']['responses'][200]['content']['application/json'];

type ListDeliverablesRequestParams = {
  moduleId?: number;
  organizationId?: number;
  projectId?: number;
};

const httpDeliverables = HttpService.root(ENDPOINT_DELIVERABLES);

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
    const deliverablesWithOverdue: ListDeliverablesElementWithOverdue[] = (result.data?.deliverables ?? []).map(
      withOverdueStatus
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

const DeliverablesService = {
  list,
};

export default DeliverablesService;
