import HttpService, { Response2 } from 'src/services/HttpService';
import {
  UpdateVariableOwnerPayload,
  UpdateVariableWorkflowDetailsPayload,
  VariableListResponse,
} from 'src/types/documentProducer/Variable';

const UPDATE_VARIABLE_DETAILS_ENDPOINT = '/api/v1/document-producer/projects/{projectId}/workflow/{variableId}';
const UPDATE_VARIABLE_OWNER_ENDPOINT = '/api/v1/document-producer/projects/{projectId}/owners/{variableId}';

const updateVariableWorkflowDetails = (
  variableId: number,
  projectId: number,
  entity: UpdateVariableWorkflowDetailsPayload
): Promise<Response2<VariableListResponse>> =>
  HttpService.root(
    UPDATE_VARIABLE_DETAILS_ENDPOINT.replace('{projectId}', projectId.toString()).replace(
      '{variableId}',
      variableId.toString()
    )
  ).put({
    entity,
  });

const updateVariableOwner = (
  variableId: number,
  projectId: number,
  entity: UpdateVariableOwnerPayload
): Promise<Response2<VariableListResponse>> =>
  HttpService.root(
    UPDATE_VARIABLE_OWNER_ENDPOINT.replace('{projectId}', projectId.toString()).replace(
      '{variableId}',
      variableId.toString()
    )
  ).put({
    entity,
  });

const VariableService = {
  updateVariableWorkflowDetails,
  updateVariableOwner,
};

export default VariableService;
