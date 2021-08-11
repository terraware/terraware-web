import { atom, selectorFamily } from 'recoil';
import { getPlantSummary } from '../../api/plants';
import { PlantSummary } from '../../api/types/plant';
import { plantsPlantedLayerSelector } from './layers';
import sessionSelector from './session';

export const plantsSummaryAtom = atom({
  key: 'plantsSummaryAtom',
  default: 0,
});

export default selectorFamily<PlantSummary[] | undefined, number>({
  key: 'plantsSummarySelector',
  get: (daysOffset: number) => async ({ get }) => {
    get(plantsSummaryAtom);
    const session = get(sessionSelector);
    const plantLayer = get(plantsPlantedLayerSelector);
    if (session && plantLayer?.id) {
      const date = new Date();
      date.setDate(date.getDate() - daysOffset);

      const plantsSummary = await getPlantSummary(session, plantLayer.id, date.toISOString());

      return plantsSummary;
    }
  },
  set: () => ({ set }) => {
    set(plantsSummaryAtom, (v) => v + 1);
  },
});
