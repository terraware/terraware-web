import HttpService, { Response2 } from 'src/services/HttpService';
import { VariableListResponse } from 'src/types/documentProducer/Variable';

const VARIABLES_ENDPOINT = '/api/v1/variables';

const getVariables = async (manifestId: number): Promise<Response2<VariableListResponse>> =>
  await HttpService.root(VARIABLES_ENDPOINT).get2({
    params: { manifestId: manifestId.toString() },
  });

const VariableService = {
  getVariables,
};

export default VariableService;
