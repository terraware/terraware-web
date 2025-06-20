import addQueryParams from 'src/api/helpers/addQueryParams';
import { paths } from 'src/api/types/generated-schema';

import HttpService, { Response2, ServerData } from '../HttpService';

// types
export type GisResponseData = ServerData & {
  content: GisResponse;
};

// endpoints
const GIS_ENDPOINT = '/api/v1/gis/wfs';

// responses
export type GisResponse = paths[typeof GIS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

const get = async (query: any): Promise<Response2<GisResponseData>> => {
  const endpoint = addQueryParams(GIS_ENDPOINT, query);
  return HttpService.root(endpoint).get2<GisResponseData>({});
};

const GisService = {
  get,
};

export default GisService;
