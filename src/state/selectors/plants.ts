import {atom, selector, selectorFamily} from 'recoil';
import {getPlants, getPlantSummary} from '../../api/plants2';
import Plant, {SearchOptions, PlantSummary} from '../../types/Plant';
import {plantsPlantedLayerSelector} from './layers';

// TODO: remove this?
export const plantsAtom = atom({
  key: 'plantsAtom',
  default: 0,
});

export const plantsSelector = selector<Plant[] | undefined>({
  key: 'plantsSelector',
  get: async ({ get }) => {
    get(plantsAtom);
    const plantLayer = get(plantsPlantedLayerSelector);
    if (plantLayer?.id) {
      const plants: Plant[] = await getPlants(plantLayer.id);

      return plants;
    }
  },
  set: ({ set }) => {
    set(plantsAtom, (v) => v + 1);
  },
});

export const plantsWithGeolocationSelector = selector<
    Plant[] | undefined
    >({
  key: 'plantsWithGeolocationSelector',
  get: ({ get }) => {
    const plants = get(plantsSelector);

    return plants?.filter((plant) => plant.coordinates);
  },
});

// TODO: remove this?
export const plantsFilteredAtom = atom({
  key: 'plantsFilteredAtom',
  default: 0,
});

// TODO: remove this?
export const plantsPlantedFiltersAtom = atom<SearchOptions>({
  key: 'plantsPlantedFiltersAtom',
  default: {},
});

export const plantsFilteredSelector = selector<Plant[] | undefined>({
  key: 'plantsFilteredSelector',
  get: async ({get}) => {
    get(plantsFilteredAtom);
    const filters = get(plantsPlantedFiltersAtom);
    const plantsPlantedLayer = get(plantsPlantedLayerSelector);
    if (plantsPlantedLayer?.id) {
      return await getPlants(plantsPlantedLayer?.id, filters);
    }
  },
  set: ({set, reset}) => {
    set(plantsFilteredAtom, (v) => v + 1);

    // We have to reset this selector to force the plantQuerySelectorFamily to be executed again
    reset(plantsSelector);

    // We have to reset these selectors to force the summarySelectoFamily to be executed again
    reset(plantsSummarySelector(0));
    reset(plantsSummarySelector(7));
  },
});

// TODO: remove this?
export const plantsSummaryAtom = atom({
  key: 'plantsSummaryAtom',
  default: 0,
});

export const plantsSummarySelector = selectorFamily<PlantSummary[] | undefined, number>({
  key: 'plantsSummarySelector',
  get:
      (daysOffset: number) =>
          async ({ get }) => {
            get(plantsSummaryAtom);
            const plantLayer = get(plantsPlantedLayerSelector);
            if (plantLayer?.id) {
              const date = new Date();
              date.setDate(date.getDate() - daysOffset);

              const plantsSummary = await getPlantSummary(
                  plantLayer.id,
                  date.toISOString()
              );

              return plantsSummary;
            }
          },
  set:
      () =>
          ({ set }) => {
            set(plantsSummaryAtom, (v) => v + 1);
          },
});