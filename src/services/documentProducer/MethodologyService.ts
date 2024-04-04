import HttpService, { Response2 } from 'src/services/HttpService';
import { MethodologyListResponse } from 'src/types/documentProducer/Methodology';

const METHODOLOGIES_ENDPOINT = '/api/v1/methodologies';

const getMethodologies = async (): Promise<Response2<MethodologyListResponse>> =>
  await HttpService.root(METHODOLOGIES_ENDPOINT).get2({});

const MethodologyService = {
  getMethodologies,
};

export default MethodologyService;
