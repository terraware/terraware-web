import { components } from 'src/api/types/generated-schema';
import { MultiPolygon } from './Tracking';
import strings from 'src/strings';

// basic information on a single observation (excluding observation results)
export type Observation = components['schemas']['ObservationPayload'];

// "Upcoming" | "InProgress" | "Completed" | "Overdue"
export type ObservationState = Observation['state'];

type Boundary = {
  boundary: MultiPolygon;
};

// expanded information on an observation including observed results down to monitoring plot level detail
// requires navigating a tree of zone results -> subzone results -> ( species results | monitoring plot results )
export type ObservationResultsPayload = components['schemas']['ObservationResultsPayload'];
export type ObservationResults = ObservationResultsPayload &
  Boundary & {
    completedDate?: string;
    plantingSiteName: string;
    plantingZones: ObservationPlantingZoneResults[];
    species: ObservationSpeciesResults[];
  };

// zone level results -> contains a list of subzone level results
export type ObservationPlantingZoneResultsPayload = components['schemas']['ObservationPlantingZoneResultsPayload'];
export type ObservationPlantingZoneResults = ObservationPlantingZoneResultsPayload &
  Boundary & {
    completedDate?: string;
    plantingZoneName: string;
    plantingSubzones: ObservationPlantingSubzoneResults[];
    species: ObservationSpeciesResults[];
    status?: MonitoringPlotStatus;
  };

// subzone level results -> contains lists of both species level results and monitoring plot level results
export type ObservationPlantingSubzoneResultsPayload =
  components['schemas']['ObservationPlantingSubzoneResultsPayload'];
export type ObservationPlantingSubzoneResults = ObservationPlantingSubzoneResultsPayload &
  Boundary & {
    plantingSubzoneName: string;
    monitoringPlots: ObservationMonitoringPlotResults[];
  };

// monitoring plot level results
export type ObservationMonitoringPlotResultsPayload = components['schemas']['ObservationMonitoringPlotResultsPayload'];
export type MonitoringPlotStatus = ObservationMonitoringPlotResultsPayload['status'];
export type ObservationMonitoringPlotResults = ObservationMonitoringPlotResultsPayload & {
  completedDate?: string;
  species: ObservationSpeciesResults[];
};

// monitoring plot photos
export type ObservationMonitoringPlotPhoto = components['schemas']['ObservationMonitoringPlotPhotoPayload'];

// species related observation statistics
export type ObservationSpeciesResultsPayload = components['schemas']['ObservationSpeciesResultsPayload'];
export type ObservationSpeciesResults = ObservationSpeciesResultsPayload & {
  speciesCommonName?: string;
  speciesScientificName: string;
};

export const getStatus = (state: ObservationState): string => {
  switch (state) {
    case 'Completed':
      return strings.COMPLETED;
    case 'InProgress':
      return strings.IN_PROGRESS;
    case 'Overdue':
      return strings.OVERDUE;
    default:
      return strings.UPCOMING;
  }
};

export const getPlotStatus = (status?: MonitoringPlotStatus): string => {
  switch (status) {
    case 'Completed':
      return strings.COMPLETED;
    case 'InProgress':
      return strings.IN_PROGRESS;
    case 'Outstanding':
      return strings.OUTSTANDING;
    default:
      return '';
  }
};
