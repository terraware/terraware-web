import { selector, selectorFamily, waitForAll } from 'recoil';
import { getPlant } from '../../api/plants';
import { Plant } from '../../api/types/plant';
import { plantsPlantedFeaturesSelector } from './plantsPlantedFeatures';
import sessionSelector from './session';

export default selector<Plant[] | undefined>({
  key: 'plantsPlantedPlantsSelector',
  get: ({ get }) => {
    const session = get(sessionSelector);
    const plantsPlantedFeatures = get(plantsPlantedFeaturesSelector);
    if (session && plantsPlantedFeatures) {
      const plants = get(
        waitForAll(
          plantsPlantedFeatures.map((plantFeature) =>
            plantQuery(plantFeature.id!)
          )
        )
      );

      const result: Plant[] = [];
      plants?.forEach((plant) => {
        if (plant) {
          result.push(plant);
        }
      });

      return result;
    }
  },
});

const plantQuery = selectorFamily<Plant | undefined, number>({
  key: 'plantQuery',
  get:
    (plantFeatureId: number) =>
    async ({ get }) => {
      const session = get(sessionSelector);
      if (session) {
        const response = await getPlant(session, plantFeatureId);

        return response;
      }
    },
});
