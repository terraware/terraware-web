import { selector } from 'recoil';
import { getLayersTypes } from '../../api/layers';
import { LayerType } from '../../api/types/layer';
import sessionSelector from './session';
import siteSelector from './site';

export const layerTypesSelector = selector<LayerType[] | undefined>({
  key: 'layerTypesSelector',
  get: async ({ get }) => {
    const session = get(sessionSelector);
    const site = get(siteSelector);
    if (session && site?.id) {
      return await getLayersTypes(session, site.id);
    }
  },
});

export const plantsPlantedLayerTypeSelector = selector({
  key: 'plantsPlantedLayerTypeSelector',
  get: async ({ get }) => {
    const layerTypes = get(layerTypesSelector);

    return layerTypes?.find((layerType) => layerType.name === 'plants planted');
  },
});
