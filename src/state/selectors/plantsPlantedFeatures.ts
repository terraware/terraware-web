import { atom, selector } from 'recoil';
import { getFeatures } from '../../api/features';
import { Feature } from '../../api/types/feature';
import { plantsPlantedLayerSelector } from './layers';
import { plantsPlantedSelector } from './plantsPlanted';
import sessionSelector from './session';

export const plantsPlantedAtom = atom({
  key: 'plantsPlantedAtom',
  default: 0,
});

export const plantsPlantedFeaturesSelector = selector<Feature[] | undefined>({
  key: 'plantsPlantedFeaturesSelector',
  get: async ({ get }) => {
    get(plantsPlantedAtom);
    const session = get(sessionSelector);
    const plantsPlantedLayer = get(plantsPlantedLayerSelector);
    if (session && plantsPlantedLayer?.id) {
      return await getFeatures(session, plantsPlantedLayer?.id);
    }
  },
  set: ({ set, reset }) => {
    set(plantsPlantedAtom, (v) => v + 1);
    // We have to reset this selector to force the plantQuerySelectorFamily to be executed again
    reset(plantsPlantedSelector);
  },
});
