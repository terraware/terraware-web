import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from 'src/services/HttpService';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

const ACCELERATOR_ORGS_ENDPOINT = '/api/v1/accelerator/organizations';
const ASSIGN_TERRAFORMATION_CONTACT_ENDPOINT = '/api/v1/accelerator/organizations/{organizationId}/tfContact';

export type AcceleratorOrgData = {
  organizations?: AcceleratorOrg[];
};

type AcceleratorOrgsResponse =
  paths[typeof ACCELERATOR_ORGS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type AcceleratorOrgsListRequestParams = paths[typeof ACCELERATOR_ORGS_ENDPOINT]['get']['parameters']['query'];

const listAcceleratorOrgs = async (
  locale: string | null,
  params?: AcceleratorOrgsListRequestParams,
  search?: SearchNodePayload,
  searchSortOrder?: SearchSortOrder
): Promise<Response & AcceleratorOrgData> => {
  let searchOrderConfig: SearchOrderConfig;
  if (searchSortOrder) {
    searchOrderConfig = {
      locale,
      sortOrder: searchSortOrder,
      numberFields: ['id'],
    };
  }

  const _params: { [key: string]: string } = {};

  if (params?.includeParticipants !== undefined) {
    _params.includeParticipants = `${params.includeParticipants}`;
  }

  if (params?.hasProjectApplication !== undefined) {
    _params.hasProjectApplication = `${params.hasProjectApplication}`;
  }

  return await HttpService.root(ACCELERATOR_ORGS_ENDPOINT).get<AcceleratorOrgsResponse, AcceleratorOrgData>(
    {
      params: _params,
    },
    (data) => ({
      organizations: searchAndSort(data?.organizations || [], search, searchOrderConfig),
    })
  );
};

const assignTerraformationContact = async (
  organizationId: number,
  terraformationContactId: number
): Promise<Response> => {
  return HttpService.root(ASSIGN_TERRAFORMATION_CONTACT_ENDPOINT).put({
    entity: { userId: terraformationContactId },
    urlReplacements: { '{organizationId}': `${organizationId}` },
  });
};

const AcceleratorService = {
  listAcceleratorOrgs,
  assignTerraformationContact,
};

export default AcceleratorService;
