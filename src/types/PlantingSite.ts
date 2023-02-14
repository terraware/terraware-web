export type Population = {
  species_scientificName: string;
  totalPlants: number;
  'totalPlants(raw)': number;
};

export type PlantingSitePlot = {
  id: string;
  fullName: string;
  populations: Population[];
};

export type PlantingSiteZone = {
  id: string;
  name: string;
  plots: PlantingSitePlot[];
};
