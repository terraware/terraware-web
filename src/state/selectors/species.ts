import {atom, selector} from 'recoil';
import {getSpeciesList} from '../../api/species2';
import SpeciesType, {SpeciesForChart} from '../../types/Species';
import {plantsSelector} from './plants';
import strings from '../../strings';
import generateRandomColor from '../../utils/generateRandomColor';

export const speciesNamesAtom = atom({
  key: 'speciesNamesAtom',
  default: 0,
});

// TODO is it necessary to even use a selector here? Why not make the API call directly?
export const speciesSelector = selector<SpeciesType[] | undefined>({
  key: 'speciesSelector',
  get: async ({ get }) => {
    get(speciesNamesAtom);

    return await getSpeciesList();
  },
  set: ({ set }) => {
    set(speciesNamesAtom, (v) => v + 1);
  },
});

const LOCAL_STORAGE_KEY = 'speciesColors';

const colorsBySpeciesSelector = selector<Record<number, string>>({
  key: 'colorsBySpeciesSelector',
  get: ({ get }) => {
    const species = get(speciesSelector);
    const speciesIds = species ? species.map((item) => item.id) : [];

    let colorsBySpecies: Record<number, string> = {};
    const colorsJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (colorsJSON) {
      colorsBySpecies = JSON.parse(colorsJSON);
    }

    // Assign a color for OTHER species
    if (!colorsBySpecies[0]) {
      colorsBySpecies[0] = generateRandomColor();
    }

    if (speciesIds.length + 1 !== Object.keys(colorsBySpecies).length) {
      speciesIds.forEach((speciesId) => {
        if (!colorsBySpecies[speciesId]) {
          colorsBySpecies[speciesId] = generateRandomColor();
        }
      });

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(colorsBySpecies));
    }

    return colorsBySpecies;
  },
});

export const speciesForChartAtom = atom({
  key: 'speciesForChartAtom',
  default: 0,
});

export const speciesForChartSelector = selector<Record<number, SpeciesForChart>>({
  key: 'speciesForChartSelector',
  get: ({get}) => {
    get(speciesForChartAtom);
    const speciesForChart: Record<number, SpeciesForChart> = {};
    const plantsPlanted = get(plantsSelector);
    const species = get(speciesSelector);
    const colorsBySpecies = get(colorsBySpeciesSelector);

    const otherSpecies: SpeciesType = {
      name: strings.OTHER,
      id: 0,
    };

    plantsPlanted?.forEach((plant) => {
      const id = plant.speciesId ?? 0;
      const plantSpecies = speciesForChart[id];
      if (plantSpecies) {
        plantSpecies.numberOfTrees += 1;
      } else {
        const speciesToAdd =
            id === 0 ? otherSpecies : species?.find((item) => item.id === id);
        if (speciesToAdd) {
          const speciesChartToAdd: SpeciesForChart = {
            species: speciesToAdd,
            numberOfTrees: 1,
            color: colorsBySpecies[id],
          };
          speciesForChart[id] = speciesChartToAdd;
        }
      }
    });

    return speciesForChart;
  },
  set: ({set}) => {
    set(speciesForChartAtom, (v) => v + 1);
  },
});


