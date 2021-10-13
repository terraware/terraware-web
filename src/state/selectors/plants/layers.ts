import { selector } from 'recoil';
import { getLayers } from 'src/api/plants/layers';
import { Layer } from 'src/api/types/layer';
import siteSelector from './site';

const layersSelector = selector<Layer[] | undefined>({
  key: 'layersSelector',
  get: async ({ get }) => {
    const site = get(siteSelector);
    if (site?.id) {
      return await getLayers(site.id);
    }
  },
});

export const plantsLayerSelector = selector<Layer | undefined>({
  key: 'plantsLayerSelector',
  get: async ({ get }) => {
    const layers = get(layersSelector);
    if (layers) {
      return layers.find((layer) => layer.layerType === 'Plants Planted');
    }
  },
});
