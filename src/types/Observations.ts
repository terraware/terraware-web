import { components } from 'src/api/types/generated-schema';
import { ObservationMonitoringPlotMediaPayload } from 'src/queries/generated/observations';
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
// requires navigating a tree of stratum results -> substratum results -> ( species results | monitoring plot results )
export type ObservationResultsPayload = components['schemas']['ObservationResultsPayload'];
export type ObservationResults = Omit<ObservationResultsPayload, 'species'> &
  Boundary & {
    completedDate?: string;
    plantingSiteName: string;
    strata: ObservationStratumResults[];
    species: ObservationSpeciesResults[];
    timeZone: string;
    totalLive: number | undefined;
    totalPlants: number;
    hasObservedPermanentPlots: boolean;
    hasObservedTemporaryPlots: boolean;
  };

export type AdHocObservationResults = Omit<ObservationResultsPayload, 'strata' | 'adHocPlot'> &
  Boundary & {
    adHocPlot: components['schemas']['ObservationMonitoringPlotResultsPayload'];
    plantingSiteName: string;
    strata: ObservationStratumResultsWithLastObv[];
    plotName?: string;
    plotNumber?: number;
    timeZone: string;
    totalLive: number | undefined;
    totalPlants: number;
  };

export type ObservationResultsWithLastObv = Omit<
  Omit<ObservationResultsPayload, 'species'> &
    Boundary & {
      completedDate?: string;
      plantingSiteName: string;
      strata: ObservationStratumResults[];
      species: ObservationSpeciesResults[];
      totalPlants: number;
      hasObservedPermanentPlots: boolean;
      hasObservedTemporaryPlots: boolean;
    },
  'strata'
> & { strata: ObservationStratumResultsWithLastObv[] };

// stratum level results -> contains a list of substratum level results
export type ObservationStratumResultsPayload = components['schemas']['ObservationStratumResultsPayload'];
export type ObservationStratumResults = ObservationStratumResultsPayload & {
  completedDate?: string;
  stratumName: string;
  substrata: ObservationSubstratumResults[];
  species: ObservationSpeciesResults[];
  status?: MonitoringPlotStatus;
  hasObservedPermanentPlots: boolean;
  hasObservedTemporaryPlots: boolean;
};

export type ObservationStratumResultsWithLastObv = Omit<ObservationStratumResults, 'substrata'> & {
  lastObv?: string;
  substrata: ObservationSubstratumResultsWithLastObv[];
};

// substratum level results -> contains lists of both species level results and monitoring plot level results
export type ObservationSubstratumResultsPayload = components['schemas']['ObservationSubstratumResultsPayload'];
export type ObservationSubstratumResults = ObservationSubstratumResultsPayload & {
  substratumName: string;
  monitoringPlots: ObservationMonitoringPlotResults[];
};
export type ObservationSubstratumResultsWithLastObv = ObservationSubstratumResults & {
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
export type ObservationMonitoringPlotPhoto = components['schemas']['ObservationMonitoringPlotMediaPayload'];
export type ObservationMonitoringPlotPhotoWithGps = Omit<ObservationMonitoringPlotPhoto, 'gpsCoordinates'> &
  Required<Pick<ObservationMonitoringPlotPhoto, 'gpsCoordinates'>>;
export type ObservationMonitoringPlotPosition = ObservationMonitoringPlotMediaPayload['position'];

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

export type RecordedPlant = components['schemas']['RecordedPlantPayload'];
export type RecordedPlantStatus = RecordedPlant['status'];

export type ObservationSummary = components['schemas']['PlantingSiteObservationSummaryPayload'];

export type StratumObservationSummary = components['schemas']['StratumObservationSummaryPayload'];

export type ExistingTreePayload = components['schemas']['ExistingTreePayload'];

export type BiomassSpeciesPayload = components['schemas']['BiomassSpeciesPayload'];

export type PlotCondition = components['schemas']['CompleteAdHocObservationRequestPayload']['conditions'][0];

export type BiomassMeasurement = components['schemas']['ExistingBiomassMeasurementPayload'];

export type MonitoringPlotFile = components['schemas']['ObservationMonitoringPlotMediaPayload'];

export type NewMonitoringPlotFile = Omit<MonitoringPlotFile, 'fileId' | 'type'> & {
  file: File;
  type?: 'Plot' | 'Quadrat' | 'Soil';
};

export type NewMonitoringPlotMediaItem = {
  type: 'new';
  data: NewMonitoringPlotFile;
};

export type ExistingMonitoringPlotMediaItem = {
  type: 'existing';
  data: MonitoringPlotFile;
  isModified?: boolean;
  isDeleted?: boolean;
};

export type MonitoringPlotMediaItem = NewMonitoringPlotMediaItem | ExistingMonitoringPlotMediaItem;

export const getPositionLabel = (position: ObservationMonitoringPlotPosition): string => {
  switch (position) {
    case 'NortheastCorner':
      return strings.NORTHEAST_CORNER;
    case 'NorthwestCorner':
      return strings.NORTHWEST_CORNER;
    case 'SoutheastCorner':
      return strings.SOUTHEAST_CORNER;
    case 'SouthwestCorner':
      return strings.SOUTHWEST_CORNER;
    default:
      return '';
  }
};

export const getQuadratLabel = (position: ObservationMonitoringPlotPosition): string => {
  switch (position) {
    case 'NortheastCorner':
      return strings.PHOTO_NORTHEAST_QUADRAT;
    case 'NorthwestCorner':
      return strings.PHOTO_NORTHWEST_QUADRAT;
    case 'SoutheastCorner':
      return strings.PHOTO_SOUTHEAST_QUADRAT;
    case 'SouthwestCorner':
      return strings.PHOTO_SOUTHWEST_QUADRAT;
    default:
      return '';
  }
};
