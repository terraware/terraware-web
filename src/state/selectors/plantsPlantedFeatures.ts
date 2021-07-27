import { selector } from 'recoil';
import { getFeatures } from '../../api/features';
import { Feature } from '../../api/types/feature';
import { plantsPlantedLayerSelector } from './layers';
import sessionSelector from './session';

export const plantsPlantedFeaturesSelector = selector<Feature[] | undefined>({
  key: 'plantsPlantedFeaturesSelector',
  get: async ({ get }) => {
    const session = get(sessionSelector);
    const plantsPlantedLayer = get(plantsPlantedLayerSelector);
    if (session && plantsPlantedLayer?.id) {
      return await getFeatures(session, plantsPlantedLayer?.id);
    }
  },
});
