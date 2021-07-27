import { selector } from 'recoil';
import { SpeciesForChart } from '../../api/types/species';
import generateRandomColor from '../../utils/generateRandomColor';
import plantsPlantedSelector from './plantsPlanted';
import sessionSelector from './session';
import speciesNamesBySpeciesIdSelector from './speciesNamesBySpeciesId';

export default selector<Record<number, SpeciesForChart>>({
  key: 'speciesForChartSelector',
  get: ({ get }) => {
    const session = get(sessionSelector);
    const speciesForChart: Record<number, SpeciesForChart> = {};
    const plantsPlanted = get(plantsPlantedSelector);
    const speciesNamesBySpeciesId = get(speciesNamesBySpeciesIdSelector);
    if (session) {
      plantsPlanted?.forEach((plant) => {
        if (plant) {
          const plantSpecies = speciesForChart[plant.species_id ?? -1];
          if (plantSpecies) {
            plantSpecies.numberOfTrees += 1;
          } else if (plant.species_id) {
            const speciesToAdd = speciesNamesBySpeciesId[plant.species_id];
            if (speciesToAdd) {
              const speciesChartToAdd: SpeciesForChart = {
                speciesName: speciesToAdd,
                numberOfTrees: 1,
                color: generateRandomColor(),
              };
              speciesForChart[plant.species_id] = speciesChartToAdd;
            }
          }
        }
      });
    }

    return speciesForChart;
  },
});
