import { components } from 'src/api/types/generated-schema';

// basic information on a single observation (excluding observation results)
export type Observation = components['schemas']['ObservationPayload'];

// "Upcoming" | "InProgress" | "Completed" | "Overdue"
export type ObservationState = Observation['state'];

// expanded information on an observation including observed results down to monitoring plot level detail
// requires navigating a tree of zone results -> subzone results -> ( species results | monitoring plot results )
export type ObservationResults = components['schemas']['ObservationResultsPayload'];

// zone level results -> contains a list of subzone level results
export type ObservationPlantingZoneResults = components['schemas']['ObservationPlantingZoneResultsPayload'];

// subzone level results -> contains lists of both species level results and monitoring plot level results
export type ObservationPlantingSubzoneResults = components['schemas']['ObservationPlantingSubzoneResultsPayload'];

// species related observation statistics
export type ObservationSpeciesResults = components['schemas']['ObservationSpeciesResultsPayload'];

// monitoring plot level results
export type ObservationMonitoringPlotResults = components['schemas']['ObservationMonitoringPlotResultsPayload'];

// monitoring plot photos
export type ObservationMonitoringPlotPhoto = components['schemas']['ObservationMonitoringPlotPhotoPayload'];
