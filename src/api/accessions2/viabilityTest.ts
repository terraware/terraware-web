import axios from 'axios';
import { paths } from '../types/generated-schema';

const VIABILITY_TEST_ENDPOINT = '/api/v2/seedbank/accessions/{accessionId}/viabilityTests';

export type ViabilityTestPostRequest =
  paths[typeof VIABILITY_TEST_ENDPOINT]['post']['requestBody']['content']['application/json'];

export type ViabilityTestPostResponse =
  paths[typeof VIABILITY_TEST_ENDPOINT]['post']['responses'][200]['content']['application/json'];

type CreateViabilityTestResponse = {
  requestSucceeded: boolean;
};

export const postViabilityTest = async (
  viabilityTest: ViabilityTestPostRequest,
  accessionId: number
): Promise<CreateViabilityTestResponse> => {
  const response: CreateViabilityTestResponse = {
    requestSucceeded: true,
  };

  try {
    const serverResponse: ViabilityTestPostResponse = (
      await axios.post(VIABILITY_TEST_ENDPOINT.replace('{accessionId}', accessionId.toString()), viabilityTest)
    ).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};
