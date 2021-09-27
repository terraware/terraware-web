import { selector } from 'recoil';
import { getLayers } from '../../api/layers';
import Layer from '../../types/Layer';
import { siteSelector } from './sites';

const layersSelector = selector<Layer[] | undefined>({
  key: 'layersSelector',
  get: async ({ get }) => {
    return await getLayers(10);
    // TODO FIX THIS
    // const site = get(siteSelector);
    // if (site) {
    //   return await getLayers(site);
    // }
  },
});

export const plantsPlantedLayerSelector = selector<Layer | undefined>({
  key: 'plantsPlantedLayerSelector',
  get: async ({ get }) => {
    const layers = get(layersSelector);

    return layers ? layers.find((layer) => layer.layerType === 'Plants Planted') : undefined;
  },
});
