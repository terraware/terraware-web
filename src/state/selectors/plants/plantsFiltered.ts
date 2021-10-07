import { atom, selector } from 'recoil';
import { getPlantsFiltered } from 'src/api/plants/plants';
import { ListPlantsResponseElement, SearchOptions } from 'src/api/types/plant';
import { plantsLayerSelector } from './layers';

export const plantsFiltersAtom = atom<SearchOptions>({
  key: 'plantsFiltersAtom',
  default: {},
});

export const plantsFilteredAtom = atom({
  key: 'plantsFilteredAtom',
  default: 0,
});

export const plantsByFeatureIdFilteredSelector = selector<Record<number, ListPlantsResponseElement> | undefined>({
  key: 'plantsByFeatureIdFilteredSelector',
  get: async ({ get }) => {
    const plants = get(plantsFilteredSelector);
    const plantsByFeatureId: Record<number, ListPlantsResponseElement> = {};
    plants?.forEach((plant) => {
      plantsByFeatureId[plant.featureId] = plant;
    });

    return plantsByFeatureId;
  },
});

export const plantsFilteredSelector = selector<ListPlantsResponseElement[] | undefined>({
  key: 'plantsFilteredSelector',
  get: async ({ get }) => {
    get(plantsFilteredAtom);
    const filters = get(plantsFiltersAtom);
    const plantsLayer = get(plantsLayerSelector);
    if (plantsLayer?.id) {
      return await getPlantsFiltered(plantsLayer?.id, filters);
    }
  },
  set: ({ set }) => {
    set(plantsFilteredAtom, (v) => v + 1);
  },
});
