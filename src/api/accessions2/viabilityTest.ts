import axios from 'axios';
import { paths } from '../types/generated-schema';

const VIABILITY_TESTS_ENDPOINT = '/api/v2/seedbank/accessions/{accessionId}/viabilityTests';

export type ViabilityTestPostRequest =
  paths[typeof VIABILITY_TESTS_ENDPOINT]['post']['requestBody']['content']['application/json'];

export type ViabilityTestPostResponse =
  paths[typeof VIABILITY_TESTS_ENDPOINT]['post']['responses'][200]['content']['application/json'];

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
      await axios.post(VIABILITY_TESTS_ENDPOINT.replace('{accessionId}', accessionId.toString()), viabilityTest)
    ).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

const VIABILITY_TEST_ENDPOINT = '/api/v2/seedbank/accessions/{accessionId}/viabilityTests/{viabilityTestId}';

export type ViabilityTestUpdateRequest =
  paths[typeof VIABILITY_TEST_ENDPOINT]['put']['requestBody']['content']['application/json'];

export type ViabilityTestUpdateResponse =
  paths[typeof VIABILITY_TEST_ENDPOINT]['put']['responses'][200]['content']['application/json'];

type UpdateViabilityTestResponse = {
  requestSucceeded: boolean;
};

export const putViabilityTest = async (
  viabilityTest: ViabilityTestUpdateRequest,
  accessionId: number,
  viabilityTestId: number
): Promise<UpdateViabilityTestResponse> => {
  const response: UpdateViabilityTestResponse = {
    requestSucceeded: true,
  };

  try {
    const serverResponse: ViabilityTestUpdateResponse = (
      await axios.put(
        VIABILITY_TEST_ENDPOINT.replace('{accessionId}', accessionId.toString()).replace(
          '{viabilityTestId}',
          viabilityTestId.toString()
        ),
        viabilityTest
      )
    ).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

export type ViabilityTestDeleteResponse =
  paths[typeof VIABILITY_TEST_ENDPOINT]['delete']['responses'][200]['content']['application/json'];

type DeleteViabilityTestResponse = {
  requestSucceeded: boolean;
};

export const deleteViabilityTest = async (
  accessionId: number,
  viabilityTestId: number
): Promise<DeleteViabilityTestResponse> => {
  const response: DeleteViabilityTestResponse = {
    requestSucceeded: true,
  };

  try {
    const serverResponse: ViabilityTestDeleteResponse = (
      await axios.delete(
        VIABILITY_TEST_ENDPOINT.replace('{accessionId}', accessionId.toString()).replace(
          '{viabilityTestId}',
          viabilityTestId.toString()
        )
      )
    ).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};
