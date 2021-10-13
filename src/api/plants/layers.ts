import axios from '..';
import { Layer, layersEndpoint, LayersListResponse } from '../types/layer';

export const getLayers = async (siteId: number): Promise<Layer[]> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${layersEndpoint}`.replace('{siteId}', `${siteId}`);

  const response: LayersListResponse = (await axios.get(endpoint)).data;

  return response.layers.map((obj) => ({ id: obj.id, layerType: obj.layerType }));
};
