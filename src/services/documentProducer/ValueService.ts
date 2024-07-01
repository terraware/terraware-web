import HttpService, { Response2 } from 'src/services/HttpService';
import {
  Operation,
  UpdateVariableValuesRequestPayload,
  VariableValuesListResponse,
} from 'src/types/documentProducer/VariableValue';

const VALUES_ENDPOINT = '/api/v1/document-producer/projects/{projectId}/values';
const IMAGES_ENDPOINT = '/api/v1/document-producer/projects/{projectId}/images';

const getDeliverableValues = (params: {
  deliverableId: number;
  projectId: number;
}): Promise<Response2<VariableValuesListResponse>> =>
  HttpService.root(VALUES_ENDPOINT.replace('{projectId}', `${params.projectId}`)).get2({
    params: {
      deliverableId: `${params.deliverableId}`,
    },
  });

const getValues = (projectId: number): Promise<Response2<VariableValuesListResponse>> =>
  HttpService.root(VALUES_ENDPOINT.replace('{projectId}', projectId.toString())).get2({});

const updateValue = (projectId: number, operations: Operation[]): Promise<Response2<VariableValuesListResponse>> => {
  const entity: UpdateVariableValuesRequestPayload = {
    operations,
  };
  return HttpService.root(VALUES_ENDPOINT.replace('{projectId}', projectId.toString())).post({
    entity,
  });
};

const uploadImageValue = (
  projectId: number,
  variableId: number,
  file: File,
  citation?: string,
  caption?: string
): Promise<Response2<VariableValuesListResponse>> => {
  const headers = { 'content-type': 'multipart/form-data' };
  return HttpService.root(IMAGES_ENDPOINT.replace('{projectId}', projectId.toString())).post({
    entity: { file, caption, citation, variableId },
    headers,
  });
};

const VariableService = {
  getDeliverableValues,
  getValues,
  updateValue,
  uploadImageValue,
};

export default VariableService;
