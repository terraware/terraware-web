import { selector } from 'recoil';
import { getLayers } from '../../api/layers';
import { Layer } from '../../api/types/layer';
import plantsPlantedLayerTypeSelector from './layerTypes';
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

export const plantsPlantedLayerSelector = selector<Layer | undefined>({
  key: 'plantsPlantedLayerSelector',
  get: async ({ get }) => {
    const plantsPlantedLayerType = get(plantsPlantedLayerTypeSelector);
    const layers = get(layersSelector);
    if (plantsPlantedLayerType && layers) {
      return layers.find(
        (layer) => layer.type_id === plantsPlantedLayerType.id
      );
    }
  },
});
