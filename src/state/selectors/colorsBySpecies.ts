import { selector } from 'recoil';
import generateRandomColor from '../../utils/generateRandomColor';
import speciesNamesBySpeciesIdSelector from './speciesNamesBySpeciesId';

const LOCAL_STORAGE_KEY = 'speciesColors';

export default selector<Record<number, string>>({
  key: 'colorsBySpeciesSelector',
  get: ({ get }) => {
    const speciesNamesBySpeciesId = get(speciesNamesBySpeciesIdSelector);
    const speciesIds = speciesNamesBySpeciesId ? Object.keys(speciesNamesBySpeciesId) : [];

    let colorsBySpecies: Record<number, string> = {};
    const colorsJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (colorsJSON) {
      colorsBySpecies = JSON.parse(colorsJSON);
    }

    if (speciesIds.length !== Object.keys(colorsBySpecies).length) {
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
