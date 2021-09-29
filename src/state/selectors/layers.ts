import { selector } from 'recoil';
import { getLayers } from '../../api/plants/layers';
import { LayerResponse } from '../../api/types/layer';
import siteSelector from './site';

const layersSelector = selector<LayerResponse[] | undefined>({
  key: 'layersSelector',
  get: async ({ get }) => {
    const site = get(siteSelector);
    if (site?.id) {
      return await getLayers(site.id);
    }
  },
});

export const plantsLayerSelector = selector<LayerResponse | undefined>({
  key: 'plantsLayerSelector',
  get: async ({ get }) => {
    const layers = get(layersSelector);
    if (layers) {
      return layers.find((layer) => layer.layerType === 'Plants Planted');
    }
  },
});
