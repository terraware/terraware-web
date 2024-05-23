import { paths } from 'src/api/types/generated-schema';
import { ServiceRequestType, SupportRequest } from 'src/types/Support';

import HttpService, { Response, Response2 } from './HttpService';

/**
 * Support API Endpoints
 */
const SUPPORT_ENDPOINT = '/api/v1/support';

type ListSupportRequestTypesServerResponse =
  paths[typeof SUPPORT_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type SubmitSupportRequestPayload = paths[typeof SUPPORT_ENDPOINT]['post']['requestBody']['content']['application/json'];
type SubmitSupportRequestServerRespnse =
  paths[typeof SUPPORT_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type ServiceRequestTypeData = {
  types: ServiceRequestType[];
};

const httpSupport = HttpService.root(SUPPORT_ENDPOINT);

/**
 * List all support requesr types
 */
const listSupportRequestTypes = (): Promise<ServiceRequestTypeData & Response> => {
  return httpSupport.get<ListSupportRequestTypesServerResponse, ServiceRequestTypeData>({}, (data) => ({
    types: data?.types ?? [],
  }));
};

/**
 * Submit a support request
 */
const submitSupportRequest = (request: SupportRequest): Promise<Response2<SubmitSupportRequestServerRespnse>> => {
  const payload: SubmitSupportRequestPayload = request;

  return httpSupport.post2<SubmitSupportRequestServerRespnse>({
    entity: payload,
  });
};

/**
 * Exported functions
 */
const SupportService = {
  listSupportRequestTypes,
  submitSupportRequest,
};

export default SupportService;
