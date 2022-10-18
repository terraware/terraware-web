import axios from 'axios';
import { addError } from '../accessions2/utils';
import { paths } from '../types/generated-schema';
import { SpeciesInventorySummary } from '../types/inventory';

const SPECIES_INVENTORY_SUMMARY_ENDPOINT = '/api/v1/nursery/species/{speciesId}/summary';

type GetSummaryResponsePayload =
  paths[typeof SPECIES_INVENTORY_SUMMARY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetSummaryResponse = {
  summary: SpeciesInventorySummary | null;
  requestSucceeded: boolean;
  error?: string;
};

export const getSummary = async (speciesId: number | string): Promise<GetSummaryResponse> => {
  const response: GetSummaryResponse = {
    summary: null,
    requestSucceeded: true,
  };
  const endpoint = SPECIES_INVENTORY_SUMMARY_ENDPOINT.replace('{speciesId}', `${speciesId}`);

  try {
    const serverResponse: GetSummaryResponsePayload = (await axios.get(endpoint)).data;

    if (serverResponse.status === 'ok') {
      response.summary = serverResponse.summary;
    } else {
      response.requestSucceeded = false;
    }
  } catch (e: any) {
    addError(e?.response?.data || {}, response);
    response.requestSucceeded = false;
  }

  return response;
};
