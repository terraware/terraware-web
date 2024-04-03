import HttpService, { Response2 } from 'src/services/HttpService';
import {
  Operation,
  UpdateVariableValuesRequestPayload,
  VariableValuesListResponse,
} from 'src/types/documentProducer/VariableValue';

const VALUES_ENDPOINT = '/api/v1/pdds/{docId}/values';
const IMAGES_ENDPOINT = '/api/v1/pdds/{docId}/images';

const getValues = async (docId: number): Promise<Response2<VariableValuesListResponse>> =>
  await HttpService.root(VALUES_ENDPOINT.replace('{docId}', docId.toString())).get2({});

const updateValue = async (docId: number, operations: Operation[]): Promise<Response2<VariableValuesListResponse>> => {
  const entity: UpdateVariableValuesRequestPayload = {
    operations,
  };
  return await HttpService.root(VALUES_ENDPOINT.replace('{docId}', docId.toString())).post({
    entity,
  });
};

const uploadImageValue = async (
  docId: number,
  variableId: number,
  file: File,
  citation?: string,
  caption?: string
): Promise<Response2<VariableValuesListResponse>> => {
  const headers = { 'content-type': 'multipart/form-data' };
  return await HttpService.root(IMAGES_ENDPOINT.replace('{docId}', docId.toString())).post({
    entity: { file, caption, citation, variableId },
    headers,
  });
};

const VariableService = {
  getValues,
  updateValue,
  uploadImageValue,
};

export default VariableService;
