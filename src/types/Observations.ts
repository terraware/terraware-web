import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

import { MultiPolygon } from './Tracking';

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
    timeZone: string;
    totalLive: number | undefined;
    totalPlants: number;
    hasObservedPermanentPlots: boolean;
    hasObservedTemporaryPlots: boolean;
  };

export type AdHocObservationResults = Omit<
  ObservationResultsPayload &
    Boundary & {
      plantingSiteName: string;
      totalPlants: number;
      plotName?: string;
      plotNumber?: number;
      plantingZones: ObservationPlantingZoneResultsWithLastObv[];
    },
  'plantingZones'
> & {
  plantingZones: ObservationPlantingZoneResultsWithLastObv[];
  totalLive: number | undefined;
};

export type ObservationResultsWithLastObv = Omit<
  Omit<ObservationResultsPayload, 'species'> &
    Boundary & {
      completedDate?: string;
      plantingSiteName: string;
      plantingZones: ObservationPlantingZoneResults[];
      species: ObservationSpeciesResults[];
      totalPlants: number;
      hasObservedPermanentPlots: boolean;
      hasObservedTemporaryPlots: boolean;
    },
  'plantingZones'
> & { plantingZones: ObservationPlantingZoneResultsWithLastObv[] };

// zone level results -> contains a list of subzone level results
export type ObservationPlantingZoneResultsPayload = components['schemas']['ObservationPlantingZoneResultsPayload'];
export type ObservationPlantingZoneResults = ObservationPlantingZoneResultsPayload & {
  completedDate?: string;
  plantingZoneName: string;
  plantingSubzones: ObservationPlantingSubzoneResults[];
  species: ObservationSpeciesResults[];
  status?: MonitoringPlotStatus;
  hasObservedPermanentPlots: boolean;
  hasObservedTemporaryPlots: boolean;
};

export type ObservationPlantingZoneResultsWithLastObv = Omit<ObservationPlantingZoneResults, 'plantingSubzones'> & {
  lastObv?: string;
  plantingSubzones: ObservationPlantingSubzoneResultsWithLastObv[];
};

// subzone level results -> contains lists of both species level results and monitoring plot level results
export type ObservationPlantingSubzoneResultsPayload =
  components['schemas']['ObservationPlantingSubzoneResultsPayload'];
export type ObservationPlantingSubzoneResults = ObservationPlantingSubzoneResultsPayload & {
  plantingSubzoneName: string;
  monitoringPlots: ObservationMonitoringPlotResults[];
};
export type ObservationPlantingSubzoneResultsWithLastObv = ObservationPlantingSubzoneResults & {
  lastObv?: string;
};
// monitoring plot level results
export type ObservationMonitoringPlotResultsPayload = components['schemas']['ObservationMonitoringPlotResultsPayload'];
export type ObservationMonitoringPlotForMap = ObservationMonitoringPlotResultsPayload & {
  isBiomassMeasurement?: boolean;
  totalShrubs?: number;
};
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
    case 'Abandoned':
      return strings.COMPLETED_ENDED;
    default:
      return strings.UPCOMING;
  }
};

export const getPlotStatus = (status?: MonitoringPlotStatus): string => {
  switch (status) {
    case 'Completed':
      return strings.COMPLETED;
    case 'Claimed':
      return strings.CLAIMED;
    case 'Unclaimed':
      return strings.UNCLAIMED;
    case 'Not Observed':
      return strings.NOT_OBSERVED;
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

export type ObservationSummary = components['schemas']['PlantingSiteObservationSummaryPayload'];

export type PlantingZoneObservationSummary = components['schemas']['PlantingZoneObservationSummaryPayload'];

export type ExistingTreePayload = components['schemas']['ExistingTreePayload'];

export type BiomassSpeciesPayload = components['schemas']['BiomassSpeciesPayload'];
