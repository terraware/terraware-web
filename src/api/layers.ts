import axios from 'axios';
import { components } from './types/generated-schema';
import Layer from '../types/Layer';

type ListLayerResponsePayload = components['schemas']['ListLayersResponsePayload'];
type LayerResponse = components['schemas']['LayerResponse'];

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/gis/layers`;

export const getLayers = async (siteId: number): Promise<Layer[]> => {
  const endpoint = `${BASE_URL}/list/${siteId}`;
  const listResponse : ListLayerResponsePayload = (await axios.get(endpoint)).data;

  return listResponse.layers.map((layer: LayerResponse) => {
    return {
      id: layer.id,
      siteId: layer.siteId,
      layerType: layer.layerType
    };
  });
};
