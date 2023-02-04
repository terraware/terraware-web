import axios from '../';
import { addError } from '../utils';
import { paths } from 'src/api/types/generated-schema';
import { Delivery } from 'src/types/Tracking';

/**
 * Get a delivery by id
 */

const DELIVERIES_ENDPOINT = '/api/v1/tracking/deliveries/{id}';

type GetDeliveryResponsePayload =
  paths[typeof DELIVERIES_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type DeliveryResponse = {
  requestSucceeded: boolean;
  delivery?: Delivery;
  error?: string;
};

export const getDelivery = async (deliveryId: number): Promise<DeliveryResponse> => {
  const response: DeliveryResponse = {
    requestSucceeded: true,
  };

  try {
    const endpoint = DELIVERIES_ENDPOINT.replace('{id}', deliveryId.toString());
    const serverResponse: GetDeliveryResponsePayload = (await axios.get(endpoint)).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
      addError(serverResponse, response);
    } else {
      response.delivery = serverResponse.delivery;
    }
  } catch (e: any) {
    response.requestSucceeded = false;
    addError(e?.response?.data || {}, response);
  }

  return response;
};

/**
 * Reassign a planting
 */

const REASSIGN_ENDPOINT = '/api/v1/tracking/deliveries/{id}/reassign';

type ReassignPostResponse = paths[typeof REASSIGN_ENDPOINT]['post']['responses'][200]['content']['application/json'];

export type ReassignPostRequestBody =
  paths[typeof REASSIGN_ENDPOINT]['post']['requestBody']['content']['application/json'];

type ReassignResponse = {
  requestSucceeded: boolean;
  error?: string;
};

export const reassignPlantings = async (
  deliveryId: number,
  reassignmentsRequest: ReassignPostRequestBody
): Promise<ReassignResponse> => {
  const response: ReassignResponse = {
    requestSucceeded: true,
  };

  try {
    const endpoint = REASSIGN_ENDPOINT.replace('{id}', deliveryId.toString());
    const serverResponse: ReassignPostResponse = (await axios.post(endpoint, reassignmentsRequest)).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
      addError(serverResponse, response);
    }
  } catch (e: any) {
    response.requestSucceeded = false;
    addError(e?.response?.data || {}, response);
  }

  return response;
};
