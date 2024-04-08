import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response } from 'src/services/HttpService';
import { AcceleratorOrg } from 'src/types/Accelerator';

const ACCELERATOR_ORGS_ENDPOINT = '/api/v1/accelerator/organizations';

export type AcceleratorOrgData = {
  organizations?: AcceleratorOrg[];
};

type AcceleratorOrgsResponse =
  paths[typeof ACCELERATOR_ORGS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const listAcceleratorOrgs = async (
  locale?: string | null,
  includeParticipants?: boolean
): Promise<Response & AcceleratorOrgData> => {
  const params: { includeParticipants?: string } = {};

  if (includeParticipants !== undefined) {
    params.includeParticipants = `${includeParticipants}`;
  }

  return await HttpService.root(ACCELERATOR_ORGS_ENDPOINT).get<AcceleratorOrgsResponse, AcceleratorOrgData>(
    {
      params,
    },
    (data) => ({
      organizations: data?.organizations.sort((a, b) => a.name.localeCompare(b.name, locale || undefined)),
    })
  );
};

const AcceleratorService = {
  listAcceleratorOrgs,
};

export default AcceleratorService;
