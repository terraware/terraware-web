const LOCAL_STORAGE_KEY = 'speciesColors';

const generateRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

export default function getColorsBySpeciesId(speciesIds: number[]): Record<number, string> {
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
}
