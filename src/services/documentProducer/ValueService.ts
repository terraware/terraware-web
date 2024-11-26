import HttpService, { Response2 } from 'src/services/HttpService';
import {
  Operation,
  UpdateVariableValuesRequestPayload,
  VariableValuesListResponse,
} from 'src/types/documentProducer/VariableValue';

const VALUES_ENDPOINT = '/api/v1/document-producer/projects/{projectId}/values';
const IMAGES_ENDPOINT = '/api/v1/document-producer/projects/{projectId}/images';

const getDeliverableValues = async (params: {
  deliverableId: number;
  projectId: number;
}): Promise<Response2<VariableValuesListResponse>> => {
  const result = await HttpService.root(
    VALUES_ENDPOINT.replace('{projectId}', `${params.projectId}`)
  ).get2<VariableValuesListResponse>({
    params: {
      deliverableId: `${params.deliverableId}`,
    },
  });

  if (result.data?.values) {
    return {
      ...result,
      data: {
        ...result.data,
        values: result.data.values.map((value) => ({
          // Set default values for workflow details if they do not exist
          internalComment: undefined,
          feedback: undefined,
          status: undefined,
          ...value,
        })),
      },
    };
  } else {
    return result;
  }
};

const getValues = (projectId: number, maxValueId?: number): Promise<Response2<VariableValuesListResponse>> =>
  HttpService.root(VALUES_ENDPOINT.replace('{projectId}', projectId.toString())).get2({
    params: maxValueId ? { maxValueId: maxValueId.toString() } : {},
  });

const getSpecificValues = (params: {
  projectId: number;
  variablesStableIds: string[];
}): Promise<Response2<VariableValuesListResponse>> => {
  return HttpService.root(VALUES_ENDPOINT.replace('{projectId}', params.projectId.toString())).get2({
    params: { stableId: params.variablesStableIds.toString() },
  });
};

const updateValue = (
  projectId: number,
  operations: Operation[],
  updateStatuses: boolean = true
): Promise<Response2<VariableValuesListResponse>> => {
  const entity: UpdateVariableValuesRequestPayload = {
    operations,
    updateStatuses,
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
  getSpecificValues,
  updateValue,
  uploadImageValue,
};

export default VariableService;
