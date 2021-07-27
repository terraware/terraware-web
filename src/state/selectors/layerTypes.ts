import { selector } from 'recoil';
import { getLayersTypes } from '../../api/layer_types';
import { LayerType } from '../../api/types/layer';
import sessionSelector from './session';

const layerTypesSelector = selector<LayerType[] | undefined>({
  key: 'layerTypesSelector',
  get: async ({ get }) => {
    const session = get(sessionSelector);
    if (session) {
      return await getLayersTypes(session);
    }
  },
});

export default selector({
  key: 'plantsPlantedLayerTypeSelector',
  get: async ({ get }) => {
    const layerTypes = get(layerTypesSelector);

    return layerTypes?.find((layerType) => layerType.name === 'plants planted');
  },
});
