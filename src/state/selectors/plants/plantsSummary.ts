import { atom, selectorFamily } from 'recoil';
import { getPlantSummary } from 'src/api/plants/plants';
import { PlantSummary } from 'src/api/types/plant';
import { plantsLayerSelector } from './layers';

export const plantsSummaryAtom = atom({
  key: 'plantsSummaryAtom',
  default: 0,
});

export default selectorFamily<PlantSummary[] | undefined, number>({
  key: 'plantsSummarySelector',
  get:
    (daysOffset: number) =>
    async ({ get }) => {
      get(plantsSummaryAtom);
      const plantLayer = get(plantsLayerSelector);
      if (plantLayer?.id) {
        const date = new Date();
        date.setDate(date.getDate() - daysOffset);

        const plantsSummary = await getPlantSummary(plantLayer.id, date.toISOString());

        return plantsSummary;
      }
    },
  set:
    () =>
    ({ set }) => {
      set(plantsSummaryAtom, (v) => v + 1);
    },
});
