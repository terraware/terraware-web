import { paths } from 'src/api/types/generated-schema';
import { SupportRequest, SupportRequestType } from 'src/types/Support';

import HttpService, { Response, Response2 } from './HttpService';

/**
 * Support API Endpoints
 */
const SUPPORT_ENDPOINT = '/api/v1/support';
const SUPPORT_ATTACHMENT_ENDPOINT = '/api/v1/support/attachment';

type ListSupportRequestTypesServerResponse =
  paths[typeof SUPPORT_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type SubmitSupportRequestPayload = paths[typeof SUPPORT_ENDPOINT]['post']['requestBody']['content']['application/json'];
type SubmitSupportRequestServerRespnse =
  paths[typeof SUPPORT_ENDPOINT]['post']['responses'][200]['content']['application/json'];
type UploadAttachmentServerResponse =
  paths[typeof SUPPORT_ATTACHMENT_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type ServiceRequestTypeData = {
  types: SupportRequestType[];
};

const httpSupport = HttpService.root(SUPPORT_ENDPOINT);
const httpSupportUpload = HttpService.root(SUPPORT_ATTACHMENT_ENDPOINT);

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
 * Upload an attachment, to be part of a support request
 */
const uploadSupportAttachment = (file: File): Promise<Response2<UploadAttachmentServerResponse>> => {
  const headers = { 'content-type': 'multipart/form-data' };
  return httpSupportUpload.post2<UploadAttachmentServerResponse>({
    entity: { file },
    headers,
  });
};

/**
 * Exported functions
 */
const SupportService = {
  listSupportRequestTypes,
  submitSupportRequest,
  uploadSupportAttachment,
};

export default SupportService;
