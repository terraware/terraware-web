import { components } from 'src/api/types/generated-schema';
import { MultiPolygon, PlantingZone, PlantingSubzone, MinimalPlantingSite } from './Tracking';
import strings from 'src/strings';

// basic information on a single observation (excluding observation results)
export type Observation = components['schemas']['ObservationPayload'];

export type ScheduleObservationRequestPayload = components['schemas']['ScheduleObservationRequestPayload'];
export type RescheduleObservationRequestPayload = components['schemas']['RescheduleObservationRequestPayload'];

// "Upcoming" | "InProgress" | "Completed" | "Overdue"
export type ObservationState = Observation['state'];

// plot replacement
export type ReplaceObservationPlotRequestPayload = components['schemas']['ReplaceObservationPlotRequestPayload'];
export type ReplaceObservationPlotResponseFullPayload = components['schemas']['ReplaceObservationPlotResponsePayload'];
export type ReplaceObservationPlotResponsePayload = Omit<ReplaceObservationPlotResponseFullPayload, 'status'>;
// "Temporary" | "LongTerm"
export type ReplaceObservationPlotDuration = ReplaceObservationPlotRequestPayload['duration'];

type Boundary = {
  boundary: MultiPolygon;
};

// expanded information on an observation including observed results down to monitoring plot level detail
// requires navigating a tree of zone results -> subzone results -> ( species results | monitoring plot results )
export type ObservationResultsPayload = components['schemas']['ObservationResultsPayload'];
export type ObservationResults = Omit<ObservationResultsPayload, 'species'> &
  Boundary & {
    completedDate?: string;
    plantingSiteName: string;
    plantingZones: ObservationPlantingZoneResults[];
    species: ObservationSpeciesResults[];
    totalPlants: number;
    hasObservedPermanentPlots: boolean;
    hasObservedTemporaryPlots: boolean;
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
    hasObservedPermanentPlots: boolean;
    hasObservedTemporaryPlots: boolean;
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
      return strings.OBSERVATION_STATUS_OUTSTANDING;
    default:
      return '';
  }
};

export const getReplaceObservationPlotDuration = (duration: ReplaceObservationPlotDuration): string => {
  switch (duration) {
    case 'Temporary':
      return strings.TEMPORARY;
    case 'LongTerm':
      return strings.LONG_TERM_PERMANENT;
    default:
      return '';
  }
};

export type Aggregation = {
  subzones: Record<number, Set<number>>;
  plots: Record<number, ObservationMonitoringPlotResultsPayload>;
  completedTime?: string;
};

export type SubzoneAggregation = PlantingSubzone & {
  monitoringPlots: ObservationMonitoringPlotResultsPayload[];
};

export type ZoneAggregation = Omit<PlantingZone, 'plantingSubzones'> & {
  completedTime?: string;
  plantingCompleted: boolean;
  plantingSubzones: SubzoneAggregation[];
};

export type PlantingSiteAggregation = Omit<MinimalPlantingSite, 'plantingZones'> & {
  plantingZones: ZoneAggregation[];
};
