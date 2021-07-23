import { selector } from 'recoil';
import { getPlant } from '../../api/plants';
import { Plant } from '../../api/types/plant';
import { plantsPlantedFeaturesSelector } from './features';
import sessionSelector from './session';

export const plantsPlantedSelector = selector<Plant[] | undefined>({
  key: 'plantsPlantedPlantsSelector',
  get: async ({ get }) => {
    const session = get(sessionSelector);
    const plantsPlantedFeatures = get(plantsPlantedFeaturesSelector);
    if (session && plantsPlantedFeatures) {
      plantsPlantedFeatures.map(async (plantFeature) => {
        if (plantFeature.id) {
          return await getPlant(session, plantFeature.id);
        } else {
          return null;
        }
      });
    }

    return undefined;
  },
});
