import HttpService, { Response2 } from 'src/services/HttpService';
import { UpdateVariableWorkflowDetailsPayload, VariableListResponse } from 'src/types/documentProducer/Variable';

const VARIABLES_ENDPOINT = '/api/v1/document-producer/variables';
const UPDATE_VARIABLE_DETAILS_ENDPOINT = '/api/v1/document-producer/projects/{projectId}/workflow/{variableId}';

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

const VariableService = {
  getDeliverableVariables,
  getVariables,
  updateVariableWorkflowDetails,
};

export default VariableService;
