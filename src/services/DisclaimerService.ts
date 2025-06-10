import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response, Response2 } from 'src/services/HttpService';

/**
 * Disclaimer related services
 */

const DISCLAIMER_ENDPOINT = '/api/v1/disclaimer';

export type GetDisclaimerResponsePayload =
  paths[typeof DISCLAIMER_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const httpDisclaimer = HttpService.root(DISCLAIMER_ENDPOINT);

const getDisclaimer = async (): Promise<Response2<GetDisclaimerResponsePayload>> => {
  return httpDisclaimer.get2<GetDisclaimerResponsePayload>({});
};

const acceptDisclaimer = (): Promise<Response> => httpDisclaimer.post();

/**
 * Exported functions
 */
const DisclaimerService = {
  acceptDisclaimer,
  getDisclaimer,
};

export default DisclaimerService;
