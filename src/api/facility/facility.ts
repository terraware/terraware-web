import axios from 'axios';
import { Device } from 'src/types/Device';
import { Facility } from '../types/facilities';
import { paths } from '../types/generated-schema';

const FACILITIES = '/api/v1/facilities';
type CreateFacilityResponsePayload = paths[typeof FACILITIES]['post']['responses'][200]['content']['application/json'];

type CreateFacilityRequestPayload = paths[typeof FACILITIES]['post']['requestBody']['content']['application/json'];

type CreateFacilityResponse = {
  facilityId: number | null;
  requestSucceeded: boolean;
};

export async function createFacility(facility: Facility): Promise<CreateFacilityResponse> {
  const response: CreateFacilityResponse = {
    facilityId: null,
    requestSucceeded: true,
  };
  const createFacilityRequestPayload: CreateFacilityRequestPayload = {
    name: facility.name,
    description: facility.description,
    siteId: facility.siteId,
    type: facility.type,
  };
  try {
    const serverResponse: CreateFacilityResponsePayload = (await axios.post(FACILITIES, createFacilityRequestPayload))
      .data;
    if (serverResponse.status === 'ok') {
      response.facilityId = serverResponse.id;
    } else {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}

const FACILITY = '/api/v1/facilities/{facilityId}';

type SimpleResponse = {
  requestSucceeded: boolean;
};

type UpdateFacilityRequestPayload = paths[typeof FACILITY]['put']['requestBody']['content']['application/json'];

export async function updateFacility(facility: Facility): Promise<SimpleResponse> {
  const response: SimpleResponse = {
    requestSucceeded: true,
  };
  const updateFacilityRequestPayload: UpdateFacilityRequestPayload = {
    name: facility.name,
    description: facility.description,
  };
  try {
    await axios.put(FACILITY.replace('{facilityId}', facility.id.toString()), updateFacilityRequestPayload);
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}

const FACILITY_DEVICES = '/api/v1/facilities/{facilityId}/devices';

type ListFacilityDevices = paths[typeof FACILITY_DEVICES]['get']['responses'][200]['content']['application/json'];

type ListFacilityDevicesResponse = {
  devices: Device[];
  requestSucceeded: boolean;
};

export async function listFacilityDevices(facility: Facility): Promise<ListFacilityDevicesResponse> {
  return listFacilityDevicesById(facility.id);
}

export async function listFacilityDevicesById(facilityId: number): Promise<ListFacilityDevicesResponse> {
  const response: ListFacilityDevicesResponse = {
    requestSucceeded: true,
    devices: [],
  };

  try {
    const serverResponse: ListFacilityDevices = (
      await axios.get(FACILITY_DEVICES.replace('{facilityId}', facilityId.toString()))
    ).data;
    response.devices = serverResponse.devices;
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}

/**
 * Mark sensor kit as configured
 */

const CONFIGURED_ENDPOINT = '/api/v1/facilities/{facilityId}/configured';

type ConfiguredResponse = {
  requestSucceeded: boolean;
};

export async function markSensorKitConfigured(facilityId: number): Promise<ConfiguredResponse> {
  const response: ConfiguredResponse = {
    requestSucceeded: true,
  };

  try {
    await axios.post(CONFIGURED_ENDPOINT.replace('{facilityId}', facilityId.toString()));
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}
