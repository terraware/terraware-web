import { EditorPlantingSite } from 'src/types/PlantingSite';

export type OnValidate = {
  allowIncomplete: boolean;
  apply: (hasErrors: boolean, data?: Partial<EditorPlantingSite>) => void;
};
