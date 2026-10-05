import { DraftPlantingSite } from 'src/types/PlantingSite';

export type OnValidate = {
  allowIncomplete: boolean;
  apply: (hasErrors: boolean, data?: Partial<DraftPlantingSite>) => void;
};
