import { atom, selector } from 'recoil';
import { SpeciesForChart, SpeciesName } from '../../api/types/species';
import strings from '../../strings';
import colorsBySpeciesSelector from './colorsBySpecies';
import { plantsPlantedSelector } from './plantsPlanted';
import sessionSelector from './session';
import speciesNamesBySpeciesIdSelector from './speciesNamesBySpeciesId';

export const speciesForChartAtom = atom({
  key: 'speciesForChartAtom',
  default: 0,
});

export default selector<Record<number, SpeciesForChart>>({
  key: 'speciesForChartSelector',
  get: ({ get }) => {
    get(speciesForChartAtom);
    const speciesForChart: Record<number, SpeciesForChart> = {};
    const session = get(sessionSelector);
    const plantsPlanted = get(plantsPlantedSelector);
    const speciesNamesBySpeciesId = get(speciesNamesBySpeciesIdSelector);
    const colorsBySpecies = get(colorsBySpeciesSelector);

    if (session) {
      plantsPlanted?.forEach((plant) => {
        const id = plant.species_id ?? 0;
        const plantSpecies = speciesForChart[id];
        if (plantSpecies) {
          plantSpecies.numberOfTrees += 1;
        } else {
          const otherSpeciesName: SpeciesName = {
            name: strings.OTHER,
            species_id: 0,
          };
          const speciesToAdd =
            id === 0 ? otherSpeciesName : speciesNamesBySpeciesId[id];
          if (speciesToAdd) {
            const speciesChartToAdd: SpeciesForChart = {
              speciesName: speciesToAdd,
              numberOfTrees: 1,
              color: colorsBySpecies[id],
            };
            speciesForChart[id] = speciesChartToAdd;
          }
        }
      });
    }

    return speciesForChart;
  },
  set: ({ set }) => {
    set(speciesForChartAtom, (v) => v + 1);
  },
});
