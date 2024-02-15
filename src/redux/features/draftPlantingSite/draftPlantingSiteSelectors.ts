import { RootState } from 'src/redux/rootReducer';
import { createCachedSelector } from 're-reselect';
import { regexMatch } from 'src/utils/search';
import { MinimalPlantingZone } from 'src/types/Tracking';
import { SubzoneAggregation, ZoneAggregation } from 'src/types/Observations';

export const selectDraftPlantingSiteCreate = (requestId: string) => (state: RootState) =>
  state.draftPlantingSiteCreate[requestId];
export const selectDraftPlantingSiteEdit = (requestId: string) => (state: RootState) =>
  state.draftPlantingSiteEdit[requestId];
export const selectDraftPlantingSiteGet = (id: number) => (state: RootState) => state.draftPlantingSiteGet[id];
export const selectDraftPlantingSite = (state: RootState, id: number) => selectDraftPlantingSiteGet(id)(state)?.data;

// search zones by name
export const searchDraftPlantingSiteZones = createCachedSelector(
  (state: RootState, plantingSiteId: number, query: string) => {
    const data = selectDraftPlantingSite(state, plantingSiteId)?.plantingZones;
    const zones: MinimalPlantingZone[] = (query ? data?.filter((datum) => regexMatch(datum.name, query)) : data) ?? [];
    return zones.map(toAggregation);
  },
  (data) => data
)((state: RootState, plantingSiteId: number, query: string) => `draft_${plantingSiteId}_${query}`);

// search subzones by name, within a specified zone
export const searchDraftPlantingSiteSubzones = createCachedSelector(
  (state: RootState, plantingSiteId: number, zoneId: number, query: string) => zoneId,
  (state: RootState, plantingSiteId: number, zoneId: number, query: string) => query,
  (state: RootState, plantingSiteId: number, zoneId: number, query: string) =>
    searchDraftPlantingSiteZones(state, plantingSiteId, ''),
  (zoneId, query, data) => {
    const zone = data.find((d) => d.id === zoneId);
    return zone
      ? {
          ...zone,
          plantingSubzones: query
            ? zone.plantingSubzones.filter((subzone) => regexMatch(subzone.fullName, query))
            : zone.plantingSubzones,
        }
      : undefined;
  }
)(
  (state: RootState, plantingSiteId: number, zoneId: number, query: string) =>
    `draft_${plantingSiteId}_${zoneId}_${query}`
);

// get a subzone by id
export const selectDraftPlantingSiteSubzone = createCachedSelector(
  (state: RootState, plantingSiteId: number, zoneId: number, subzoneId: number) => subzoneId,
  (state: RootState, plantingSiteId: number, zoneId: number) =>
    searchDraftPlantingSiteSubzones(state, plantingSiteId, zoneId, ''),
  (subzoneId, zone) => {
    const subzone = zone?.plantingSubzones.find((sz) => sz.id === subzoneId);
    if (subzone) {
      return {
        ...zone,
        plantingSubzones: [subzone],
      } as ZoneAggregation;
    } else {
      return undefined;
    }
  }
)(
  (state: RootState, plantingSiteId: number, zoneId: number, subzoneId: number) =>
    `draft_${plantingSiteId}_${zoneId}_${subzoneId}`
);

// convert zone to aggregation view
const toAggregation = (zone: MinimalPlantingZone): ZoneAggregation =>
  ({
    ...zone,
    areaHa: 0,
    plantingSubzones: zone.plantingSubzones.map(
      (subzone) =>
        ({
          ...subzone,
          areaHa: 0,
          monitoringPlots: [],
        }) as SubzoneAggregation
    ),
  }) as ZoneAggregation;
