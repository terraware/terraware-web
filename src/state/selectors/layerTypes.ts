import { selector } from 'recoil';
import { getLayersTypes } from '../../api/plants/layer_types';
import { LayerType } from '../../api/types/layer';

const layerTypesSelector = selector<LayerType[] | undefined>({
  key: 'layerTypesSelector',
  get: async ({ get }) => {
    return await getLayersTypes();
  },
});

export default selector({
  key: 'plantsPlantedLayerTypeSelector',
  get: async ({ get }) => {
    const layerTypes = get(layerTypesSelector);

    return layerTypes?.find((layerType) => layerType.name === 'plants planted');
  },
});
