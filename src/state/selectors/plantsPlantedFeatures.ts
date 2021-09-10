import { atom, selector } from 'recoil';
import { getFeatures } from '../../api/features';
import { Feature } from '../../api/types/feature';
import { plantsPlantedLayerSelector } from './layers';
import { plantsPlantedSelector } from './plantsPlanted';
import plantsSummarySelector from './plantsSummary';

export const plantsPlantedFeatureAtom = atom({
  key: 'plantsPlantedFeatureAtom',
  default: 0,
});

export const plantsPlantedFeaturesSelector = selector<Feature[] | undefined>({
  key: 'plantsPlantedFeaturesSelector',
  get: async ({ get }) => {
    get(plantsPlantedFeatureAtom);
    const plantsPlantedLayer = get(plantsPlantedLayerSelector);
    if (plantsPlantedLayer?.id) {
      return await getFeatures(plantsPlantedLayer?.id);
    }
  },
  set: ({ set, reset }) => {
    set(plantsPlantedFeatureAtom, (v) => v + 1);
    // We have to reset this selector to force the plantQuerySelectorFamily to be executed again
    reset(plantsPlantedSelector);

    // We have to reset these selectors to force the summarySelectoFamily to be executed again
    reset(plantsSummarySelector(0));
    reset(plantsSummarySelector(7));
  },
});

export const plantsPlantedFeaturesWithGeolocationSelector = selector<
  Feature[] | undefined
>({
  key: 'plantsPlantedFeaturesWithGeolocationSelector',
  get: ({ get }) => {
    const features = get(plantsPlantedFeaturesSelector);

    return features?.filter((feature) => feature.geom);
  },
});
