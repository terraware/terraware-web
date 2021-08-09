import { atom, selector } from 'recoil';
import { getPlants } from '../../api/plants';
import { Plant } from '../../api/types/plant';
import { plantsPlantedLayerSelector } from './layers';
import sessionSelector from './session';

export const plantsPlantedPlantsAtom = atom({
  key: 'plantsPlantedPlantsAtom',
  default: 0,
});

export const plantsPlantedSelector = selector<Plant[] | undefined>({
  key: 'plantsPlantedPlantsSelector',
  get: async ({ get }) => {
    get(plantsPlantedPlantsAtom);
    const session = get(sessionSelector);
    const plantLayer = get(plantsPlantedLayerSelector);
    if (session && plantLayer?.id) {
      const plants: Plant[] = await getPlants(session, plantLayer.id);

      return plants;
    }

    return [];
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
