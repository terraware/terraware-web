import { DraftPlantingSite } from 'src/types/PlantingSite';

export type OnValidate = {
  isSaveAndClose: boolean;
  apply: (hasErrors: boolean, data?: Partial<DraftPlantingSite>, isOptionalCompleted?: boolean) => void;
};
