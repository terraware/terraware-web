import { selector } from 'recoil';
import { getLayers } from '../../api/layers';
import { Layer } from '../../api/types/layer';
import plantsPlantedLayerTypeSelector from './layerTypes';
import sessionSelector from './session';
import siteSelector from './site';

const layersSelector = selector<Layer[] | undefined>({
  key: 'layersSelector',
  get: async ({ get }) => {
    const session = get(sessionSelector);
    const site = get(siteSelector);
    if (session && site?.id) {
      return await getLayers(session, site.id);
    }
  },
});

export const plantsPlantedLayerSelector = selector<Layer | undefined>({
  key: 'plantsPlantedLayerSelector',
  get: async ({ get }) => {
    const session = get(sessionSelector);
    const plantsPlantedLayerType = get(plantsPlantedLayerTypeSelector);
    const layers = get(layersSelector);
    if (session && plantsPlantedLayerType && layers) {
      return layers.find(
        (layer) => layer.type_id === plantsPlantedLayerType.id
      );
    }
  },
});
