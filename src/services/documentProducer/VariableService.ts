import HttpService, { Response2 } from 'src/services/HttpService';
import {
  UpdateVariableOwnerPayload,
  UpdateVariableWorkflowDetailsPayload,
  VariableListResponse,
  VariableOwnersListResponse,
} from 'src/types/documentProducer/Variable';

const VARIABLES_ENDPOINT = '/api/v1/document-producer/variables';
const UPDATE_VARIABLE_DETAILS_ENDPOINT = '/api/v1/document-producer/projects/{projectId}/workflow/{variableId}';
const UPDATE_VARIABLE_OWNER_ENDPOINT = '/api/v1/document-producer/projects/{projectId}/owners/{variableId}';
const VARIABLE_OWNERS_ENDPOINT = '/api/v1/document-producer/projects/{projectId}/owners';

const getAllVariables = (): Promise<Response2<VariableListResponse>> => HttpService.root(VARIABLES_ENDPOINT).get2({});

const getDeliverableVariables = (deliverableId: number): Promise<Response2<VariableListResponse>> =>
  HttpService.root(VARIABLES_ENDPOINT).get2({
    params: { deliverableId: `${deliverableId}` },
  });

const getVariables = (manifestId: number): Promise<Response2<VariableListResponse>> =>
  HttpService.root(VARIABLES_ENDPOINT).get2({
    params: { manifestId: manifestId.toString() },
  });

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

const getVariablesOwners = (projectId: number): Promise<Response2<VariableOwnersListResponse>> =>
  HttpService.root(VARIABLE_OWNERS_ENDPOINT).get2({
    urlReplacements: { '{projectId}': projectId.toString() },
  });

const VariableService = {
  getAllVariables,
  getDeliverableVariables,
  getVariables,
  updateVariableWorkflowDetails,
  updateVariableOwner,
  getVariablesOwners,
};

export default VariableService;
