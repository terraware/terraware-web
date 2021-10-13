import { atom, selector } from 'recoil';
import { Species } from 'src/api/types/species';
import strings from 'src/strings';
import speciesNamesBySpeciesIdSelector from '../speciesById';
import colorsBySpeciesSelector from './colorsBySpecies';
import { plantsSelector } from './plants';

type SpeciesForChart = {
  speciesName: Species;
  numberOfTrees: number;
  color: string;
};

export const speciesForChartAtom = atom({
  key: 'speciesForChartAtom',
  default: 0,
});

export default selector<Record<number, SpeciesForChart>>({
  key: 'speciesForChartSelector',
  get: ({ get }) => {
    get(speciesForChartAtom);
    const speciesForChart: Record<number, SpeciesForChart> = {};
    const plants = get(plantsSelector);
    const speciesNamesBySpeciesId = get(speciesNamesBySpeciesIdSelector);
    const colorsBySpecies = get(colorsBySpeciesSelector);

    const otherSpeciesName: Species = {
      name: strings.OTHER,
      id: 0,
    };

    plants?.forEach((plant) => {
      const id = plant.speciesId ?? 0;
      const plantSpecies = speciesForChart[id];
      if (plantSpecies) {
        plantSpecies.numberOfTrees += 1;
      } else {
        const speciesToAdd = id === 0 ? otherSpeciesName : speciesNamesBySpeciesId[id];
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

    return speciesForChart;
  },
  set: ({ set }) => {
    set(speciesForChartAtom, (v) => v + 1);
  },
});
