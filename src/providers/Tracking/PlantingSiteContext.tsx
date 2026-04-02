import { createContext, useContext } from 'react';

export type PlantingSiteData = {
  selectedPlantingSiteId?: number;
  setSelectedPlantingSite: (plantingSiteId?: number) => void;
};

// default values pointing to nothing
export const PlantingSiteContext = createContext<PlantingSiteData>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSelectedPlantingSite: () => {},
});

export const usePlantingSiteData = () => useContext(PlantingSiteContext);
