import { paths } from './generated-schema';

export const layersEndpoint = '/api/v1/gis/layers/list/{siteId}';
export type LayersListResponse = paths[typeof layersEndpoint]['get']['responses'][200]['content']['application/json'];
type LayerType = LayersListResponse['layers'][0]['layerType'];

export interface Layer {
  id?: number;
  layerType: LayerType;
}
