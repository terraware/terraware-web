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
        if (plant.species_id) {
          const plantSpecies = speciesForChart[plant.species_id];
          if (plantSpecies) {
            plantSpecies.numberOfTrees += 1;
          } else {
            const speciesToAdd = speciesNamesBySpeciesId[plant.species_id];
            if (speciesToAdd) {
              const speciesChartToAdd: SpeciesForChart = {
                speciesName: speciesToAdd,
                numberOfTrees: 1,
                color: colorsBySpecies[speciesToAdd.species_id],
              };
              speciesForChart[plant.species_id] = speciesChartToAdd;
            }
          }
        } else {
          //if NO species_id, add to OTHER
          const otherSpecies = speciesForChart[0];
          if (otherSpecies) {
            otherSpecies.numberOfTrees += 1;
          } else {
            const otherSpeciesName: SpeciesName = {
              name: strings.OTHER,
              species_id: 0,
            };
            speciesForChart[0] = {
              speciesName: otherSpeciesName,
              numberOfTrees: 1,
              color: colorsBySpecies[0],
            };
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
