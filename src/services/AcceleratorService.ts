import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from 'src/services/HttpService';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

const ACCELERATOR_ORGS_ENDPOINT = '/api/v1/accelerator/organizations';

export type AcceleratorOrgData = {
  organizations?: AcceleratorOrg[];
};

type AcceleratorOrgsResponse =
  paths[typeof ACCELERATOR_ORGS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const listAcceleratorOrgs = async (
  locale: string | null,
  includeParticipants?: boolean,
  search?: SearchNodePayload,
  searchSortOrder?: SearchSortOrder
): Promise<Response & AcceleratorOrgData> => {
  const params: { includeParticipants?: string } = {};
  let searchOrderConfig: SearchOrderConfig;
  if (searchSortOrder) {
    searchOrderConfig = {
      locale,
      sortOrder: searchSortOrder,
      numberFields: ['id'],
    };
  }

  if (includeParticipants !== undefined) {
    params.includeParticipants = `${includeParticipants}`;
  }

  return await HttpService.root(ACCELERATOR_ORGS_ENDPOINT).get<AcceleratorOrgsResponse, AcceleratorOrgData>(
    {
      params,
    },
    (data) => ({
      organizations: searchAndSort(data?.organizations || [], search, searchOrderConfig),
    })
  );
};

const AcceleratorService = {
  listAcceleratorOrgs,
};

export default AcceleratorService;
