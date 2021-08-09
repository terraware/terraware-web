import { atom, selector, selectorFamily, waitForAll } from 'recoil';
import { getPlant, getPlantsFiltered } from '../../api/plants';
import { Plant } from '../../api/types/plant';
import { SearchOptions } from '../../components/AllPlants';
import { plantsPlantedLayerSelector } from './layers';
import { plantsPlantedFeaturesSelector } from './plantsPlantedFeatures';
import sessionSelector from './session';

export const plantsPlantedPlantsAtom = atom({
  key: 'plantsPlantedPlantsAtom',
  default: 0,
});

export const plantsPlantedFiltersAtom = atom({
  key: 'plantsPlantedFiltersAtom',
  default: {} as SearchOptions,
});

export const plantsPlantedSelector = selector<Plant[] | undefined>({
  key: 'plantsPlantedPlantsSelector',
  get: ({ get }) => {
    get(plantsPlantedPlantsAtom);
    const session = get(sessionSelector);
    const plantsPlantedFeatures = get(plantsPlantedFeaturesSelector);
    if (session && plantsPlantedFeatures) {
      const plants = get(
        waitForAll(
          plantsPlantedFeatures.map((plantFeature) =>
            plantQuerySelectorFamily(plantFeature.id!)
          )
        )
      );

      const result = plants.filter((plant): plant is Plant => !!plant);

      return result;
    }
  },
  set: ({ set }) => {
    set(plantsPlantedPlantsAtom, (v) => v + 1);
  },
});

const plantQuerySelectorFamily = selectorFamily<Plant | undefined, number>({
  key: 'plantQuery',
  get:
    (plantFeatureId: number) =>
    async ({ get }) => {
      get(plantsPlantedPlantsAtom);
      try {
        const session = get(sessionSelector);
        if (session) {
          const response = await getPlant(session, plantFeatureId);

          return response;
        }
      } catch {
        //
      }
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

export const plantsByFeatureIdFilteredSelector = selector<
  Record<number, Plant> | undefined
>({
  key: 'plantsByFeatureIdFilteredSelector',
  get: async ({ get }) => {
    const plants = get(plantsPlantedFilteredSelector);
    const plantsByFeatureId: Record<number, Plant> = {};
    plants?.forEach((plant) => {
      plantsByFeatureId[plant.feature_id] = plant;
    });

    return plantsByFeatureId;
  },
});

export const plantsPlantedFilteredSelector = selector<Plant[] | undefined>({
  key: 'plantsPlantedFilteredSelector',
  get: async ({ get }) => {
    const filters = get(plantsPlantedFiltersAtom);
    const session = get(sessionSelector);
    const plantsPlantedLayer = get(plantsPlantedLayerSelector);
    if (session && plantsPlantedLayer?.id) {
      return await getPlantsFiltered(session, plantsPlantedLayer?.id, filters);
    }
  },
});
