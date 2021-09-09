import { atom, selector } from 'recoil';
import { getPlantsFiltered } from '../../api/plants';
import { Plant } from '../../api/types/plant';
import { plantsPlantedLayerSelector } from './layers';

export type SearchOptions = {
  species_name?: string;
  min_entered_time?: string;
  max_entered_time?: string;
  notes?: string;
};

export const plantsPlantedFiltersAtom = atom<SearchOptions>({
  key: 'plantsPlantedFiltersAtom',
  default: {},
});

export const plantsPlantedFilteredAtom = atom({
  key: 'plantsPlantedFilteredAtom',
  default: 0,
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
    get(plantsPlantedFilteredAtom);
    const filters = get(plantsPlantedFiltersAtom);
    const plantsPlantedLayer = get(plantsPlantedLayerSelector);
    if (plantsPlantedLayer?.id) {
      return await getPlantsFiltered(plantsPlantedLayer?.id, filters);
    }
  },
  set: ({ set }) => {
    set(plantsPlantedFilteredAtom, (v) => v + 1);
  },
});
