import { atom, selector } from 'recoil';
import { getPlants } from '../../api/plants';
import { Plant } from '../../api/types/plant';
import { plantsPlantedLayerSelector } from './layers';

export const plantsPlantedPlantsAtom = atom({
  key: 'plantsPlantedPlantsAtom',
  default: 0,
});

export const plantsPlantedSelector = selector<Plant[] | undefined>({
  key: 'plantsPlantedPlantsSelector',
  get: async ({ get }) => {
    get(plantsPlantedPlantsAtom);
    const plantLayer = get(plantsPlantedLayerSelector);
    if (plantLayer?.id) {
      const plants: Plant[] = await getPlants(plantLayer.id);

      return plants;
    }
  },
  set: ({ set }) => {
    set(plantsPlantedPlantsAtom, (v) => v + 1);
  },
});

export const plantsByFeatureIdSelector = selector<
  Record<number, Plant> | undefined
>({
  key: 'plantsByFeatureIdSelector',
  get: async ({ get }) => {
    const plants = get(plantsPlantedSelector);
    const plantsByFeatureId: Record<number, Plant> = {};
    plants?.forEach((plant) => {
      plantsByFeatureId[plant.feature_id] = plant;
    });

    return plantsByFeatureId;
  },
});
