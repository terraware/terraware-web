import { createCachedSelector } from 're-reselect';
import { RootState } from 'src/redux/rootReducer';
import { ObservationResults } from 'src/types/Observations';
import { selectMergedPlantingSiteObservations } from './observationsSelectors';
import { searchResultZones } from './utils';

// search observation details (search planting zone name only)
export type SearchParams = {
  plantingSiteId: number;
  observationId: number;
  search: string;
};
export const searchObservationDetails = createCachedSelector(
  (state: RootState, params: SearchParams, defaultTimeZone: string) =>
    selectMergedPlantingSiteObservations(state, params.plantingSiteId, defaultTimeZone),
  (state: RootState, params: SearchParams, defaultTimeZone: string) => params,
  (observations, params) =>
    searchResultZones(params.search, selectObservationDetails(params.observationId, observations))
)(
  (state: RootState, params: SearchParams, defaultTimeZone: string) =>
    `${params.plantingSiteId}_${params.observationId}_${defaultTimeZone}_${params.search}`
);

// utils
const selectObservationDetails = (
  observationId: number,
  observations?: ObservationResults[]
): ObservationResults | undefined =>
  observations?.find((observation: ObservationResults) => observation.observationId === observationId);
