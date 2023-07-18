import { components } from 'src/api/types/generated-schema';

export type Population = {
  species_scientificName: string;
  totalPlants: number;
  'totalPlants(raw)': number;
};

export type PlantingSiteSubzone = {
  id: string;
  fullName: string;
  populations: Population[];
};

export type PlantingSiteZone = {
  id: string;
  name: string;
  plantingSubzones: PlantingSiteSubzone[];
};

export type PlantingSiteReportedPlants = components['schemas']['PlantingSiteReportedPlantsPayload'];

export type PlantingProgressSubzone = {
  subzoneName: string;
  plantingComplete: boolean;
  plantingSite: string;
  zone: string;
  targetPlantingDensity: number;
  totalSeedlingsSent?: number;
};

export type UpdatePlantingSubzonePayload = components['schemas']['UpdatePlantingSubzoneRequestPayload'];
