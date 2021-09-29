import { atom, selector, selectorFamily } from 'recoil';
import { getFeatures } from '../../api/plants/features';
import { Feature } from '../../api/types/feature';
import { plantsLayerSelector } from './layers';
import { plantsSelector } from './plants';
import plantsSummarySelector from './plantsSummary';

export const plantsFeatureAtom = atom({
  key: 'plantsFeatureAtom',
  default: 0,
});

export const plantsFeaturesSelector = selector<Feature[] | undefined>({
  key: 'plantsFeaturesSelector',
  get: async ({ get }) => {
    get(plantsFeatureAtom);
    const plantsLayer = get(plantsLayerSelector);
    if (plantsLayer?.id) {
      return await getFeatures(plantsLayer?.id);
    }
  },
  set: ({ set, reset }) => {
    set(plantsFeatureAtom, (v) => v + 1);
    // We have to reset this selector to force the plantQuerySelectorFamily to be executed again
    reset(plantsSelector);

    // We have to reset these selectors to force the summarySelectoFamily to be executed again
    reset(plantsSummarySelector(0));
    reset(plantsSummarySelector(7));
  },
});

export type PlantsPlantedFeaturesPaginatedOptions = {
  limit: number;
  skip: number;
};

export const plantsPlantedFeaturesPaginatedSelector = selectorFamily<
  Feature[] | undefined,
  PlantsPlantedFeaturesPaginatedOptions
>({
  key: 'plantsPlantedFeaturesPaginatedSelector',
  get:
    (plantsPlantedFeaturesPaginatedOptions) =>
    async ({ get }) => {
      get(plantsFeatureAtom);
      const plantsPlantedLayer = get(plantsLayerSelector);
      if (plantsPlantedLayer?.id) {
        return await getFeatures(
          plantsPlantedLayer?.id,
          plantsPlantedFeaturesPaginatedOptions.limit,
          plantsPlantedFeaturesPaginatedOptions.skip
        );
      }
    },
  set:
    () =>
    ({ set, reset }) => {
      set(plantsFeatureAtom, (v) => v + 1);
      // We have to reset this selector to force the plantQuerySelectorFamily to be executed again
      reset(plantsSelector);

      // We have to reset these selectors to force the summarySelectoFamily to be executed again
      reset(plantsSummarySelector(0));
      reset(plantsSummarySelector(7));
    },
});

export const plantsFeaturesWithGeolocationSelector = selector<
  Feature[] | undefined
>({
  key: 'plantsFeaturesWithGeolocationSelector',
  get: ({ get }) => {
    const features = get(plantsFeaturesSelector);

    return features?.filter((feature) => feature.geom);
  },
});
