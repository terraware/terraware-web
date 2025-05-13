import { createContext, useContext } from 'react';

import { Observation, ObservationResultsPayload, ObservationSummary } from 'src/types/Observations';
import { PlantingSite, PlantingSiteHistory, PlantingSiteReportedPlants } from 'src/types/Tracking';

export type PlantingSiteData = {
  acceleratorOrganizationId?: number;
  setAcceleratorOrganizationId: (organizationId: number) => void;

  allPlantingSites?: PlantingSite[];

  plantingSite?: PlantingSite;
  plantingSiteReportedPlants?: PlantingSiteReportedPlants;
  plantingSiteHistories?: PlantingSiteHistory[];
  setSelectedPlantingSite: (plantingSiteId: number) => void;

  adHocObservations?: Observation[];
  adHocObservationResults?: ObservationResultsPayload[];
  observations?: Observation[];
  observationResults?: ObservationResultsPayload[];
  observationSummaries?: ObservationSummary[];

  currentObservation?: Observation;
  latestObservation?: Observation;
  nextObservation?: Observation;

  currentResult?: ObservationResultsPayload;
  latestResult?: ObservationResultsPayload;
  nextResult?: ObservationResultsPayload;
};

// default values pointing to nothing
export const PlantingSiteContext = createContext<PlantingSiteData>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAcceleratorOrganizationId: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setSelectedPlantingSite: () => {},
});

export const usePlantingSiteData = () => useContext(PlantingSiteContext);
