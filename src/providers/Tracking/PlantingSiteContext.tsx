import { createContext, useContext } from 'react';

import { Observation, ObservationResultsPayload, ObservationSummary } from 'src/types/Observations';
import { PlantingSite, PlantingSiteHistory } from 'src/types/Tracking';

export type PlantingSiteData = {
  allPlantingSites?: PlantingSite[];

  plantingSite?: PlantingSite;
  plantingSiteHistories?: PlantingSiteHistory[];
  setSelectedPlantingSite: (plantingSiteId: number) => void;

  adHocObservations?: Observation[];
  adHocObservationResults?: ObservationResultsPayload[];
  observations?: Observation[];
  observationResults?: ObservationResultsPayload[];
  observationSummaries?: ObservationSummary[];

  latestObservation?: ObservationResultsPayload;
};

// default values pointing to nothing
export const PlantingSiteContext = createContext<PlantingSiteData>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSelectedPlantingSite: () => {},
});

export const usePlantingSiteData = () => useContext(PlantingSiteContext);
