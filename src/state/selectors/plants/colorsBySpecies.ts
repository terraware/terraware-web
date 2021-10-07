import { selector } from 'recoil';
import generateRandomColor from '../../../utils/generateRandomColor';
import speciesByIdSelector from '../speciesById';

const LOCAL_STORAGE_KEY = 'speciesColors';

export default selector<Record<number, string>>({
  key: 'colorsBySpeciesSelector',
  get: ({ get }) => {
    const speciesById = get(speciesByIdSelector);
    const speciesIds = speciesById
      ? Object.keys(speciesById)
      : [];

    let colorsBySpecies: Record<number, string> = {};
    const colorsJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (colorsJSON) {
      colorsBySpecies = JSON.parse(colorsJSON);
    }

    // Asign a color for OTHER species
    if (!colorsBySpecies[0]) {
      colorsBySpecies[0] = generateRandomColor();
    }

    if (speciesIds.length + 1 !== Object.keys(colorsBySpecies).length) {
      speciesIds.forEach((speciesId) => {
        const index = parseInt(speciesId, 10);
        if (!colorsBySpecies[index]) {
          colorsBySpecies[index] = generateRandomColor();
        }
      });

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(colorsBySpecies));
    }

    return colorsBySpecies;
  },
});
