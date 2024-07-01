import HttpService, { Response2 } from 'src/services/HttpService';
import { VariableListResponse } from 'src/types/documentProducer/Variable';

const VARIABLES_ENDPOINT = '/api/v1/document-producer/variables';

const getDeliverableVariables = (deliverableId: number): Promise<Response2<VariableListResponse>> =>
  HttpService.root(VARIABLES_ENDPOINT).get2({
    params: { deliverableId: `${deliverableId}` },
  });

const getVariables = (manifestId: number): Promise<Response2<VariableListResponse>> =>
  HttpService.root(VARIABLES_ENDPOINT).get2({
    params: { manifestId: manifestId.toString() },
  });

const VariableService = {
  getDeliverableVariables,
  getVariables,
};

export default VariableService;
