import axios from 'axios';
import { Device } from 'src/types/Device';
import { Facility } from 'src/types/Facility';
import { paths } from '../types/generated-schema';

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
