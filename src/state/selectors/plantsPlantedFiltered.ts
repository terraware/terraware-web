import { atom, selector } from 'recoil';
import { getPlantsFiltered } from '../../api/plants';
import { Plant } from '../../api/types/plant';
import { plantsPlantedLayerSelector } from './layers';
import sessionSelector from './session';

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
