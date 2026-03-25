import { createContext, useContext } from 'react';

import { ObservationResultsPayload } from 'src/types/Observations';
import { PlantingSite } from 'src/types/Tracking';

export type PlantingSiteData = {
  acceleratorOrganizationId?: number;
  setAcceleratorOrganizationId: (organizationId: number) => void;

  allPlantingSites?: PlantingSite[];

  plantingSite?: PlantingSite;
  setSelectedPlantingSite: (plantingSiteId?: number) => void;

  latestResult?: ObservationResultsPayload;

  isLoading: boolean;
  isInitiated: boolean;
  reload: () => void;
};

// default values pointing to nothing
export const PlantingSiteContext = createContext<PlantingSiteData>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAcceleratorOrganizationId: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSelectedPlantingSite: () => {},
  isLoading: true,
  isInitiated: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reload: () => {},
});

export const usePlantingSiteData = () => useContext(PlantingSiteContext);
