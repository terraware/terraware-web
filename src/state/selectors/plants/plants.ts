import { atom, selector } from 'recoil';
import { getPlants } from 'src/api/plants/plants';
import { PlantsListResponseElement } from 'src/api/types/plant';
import { plantsLayerSelector } from './layers';

export const plantsPlantsAtom = atom({
  key: 'plantsPlantsAtom',
  default: 0,
});

export const plantsSelector = selector<PlantsListResponseElement[] | undefined>({
  key: 'plantsPlantsSelector',
  get: async ({ get }) => {
    get(plantsPlantsAtom);
    const plantLayer = get(plantsLayerSelector);
    if (plantLayer?.id) {
      const plants = await getPlants(plantLayer.id);

      return plants;
    }
  },
  set: ({ set }) => {
    set(plantsPlantsAtom, (v) => v + 1);
  },
});

export const plantsByFeatureIdSelector = selector<Record<number, PlantsListResponseElement> | undefined>({
  key: 'plantsByFeatureIdSelector',
  get: async ({ get }) => {
    const plants = get(plantsSelector);
    const plantsByFeatureId: Record<number, PlantsListResponseElement> = {};
    plants?.forEach((plant) => {
      plantsByFeatureId[plant.featureId] = plant;
    });

    return plantsByFeatureId;
  },
});
