import { paths } from 'src/api/types/generated-schema';
import { MapBoundingBox, MapData, MapEntity, MapGeometry, MapSourceBaseData } from 'src/types/Map';
import {
  AdHocObservationResults,
  ObservationMonitoringPlotResults,
  ObservationMonitoringPlotResultsPayload,
  ObservationPlantingSubzoneResults,
  ObservationPlantingZoneResults,
  ObservationResultsWithLastObv,
  ObservationSummary,
} from 'src/types/Observations';
import { MinimalPlantingSite, MultiPolygon, PlantingSite, PlantingSiteHistory } from 'src/types/Tracking';
import { isAfter } from 'src/utils/dateUtils';

import HttpService, { Response } from './HttpService';

/**
 * Map related service
 */

/**
 * Exported types
 */

export type MapboxToken = {
  token?: string;
};

export type MapboxTokenResponse = Response & MapboxToken;

const MAPBOX_TOKEN_ENDPOINT = '/api/v1/tracking/mapbox/token';
type MapboxTokenServerResponse =
  paths[typeof MAPBOX_TOKEN_ENDPOINT]['get']['responses'][200]['content']['application/json'];

/**
 * Fetch a mapbox api token.
 */
export const getMapboxToken = async (): Promise<MapboxTokenResponse> => {
  const response: MapboxTokenResponse = await HttpService.root(MAPBOX_TOKEN_ENDPOINT).get<
    MapboxTokenServerResponse,
    MapboxToken
  >({}, (data) => ({
    token: data?.token,
  }));

  return response;
};

/**
 * Get the encompassing bounding box from a list of geometries
 */
const getBoundingBox = (geometries: MapGeometry[]): MapBoundingBox => {
  let llx = 0;
  let lly = 0;
  let urx = 0;
  let ury = 0;
  let first = true;

  const comparePoint = (x: number, y: number) => {
    if (first) {
      llx = x;
      urx = x;
      lly = y;
      ury = y;
      first = false;
      return;
    }
    if (x < llx) {
      llx = x;
    }
    if (x > urx) {
      urx = x;
    }
    if (y < lly) {
      lly = y;
    }
    if (y > ury) {
      ury = y;
    }
  };

  const scanArray = (coord: number[]) => {
    if (!Array.isArray(coord) || coord.length !== 2) {
      return;
    }
    const [x, y] = coord;
    if (x !== undefined && y !== undefined) {
      comparePoint(x, y);
    }
  };

  const scanGeometry = (geom: MapGeometry) => {
    if (!Array.isArray(geom) || !geom.length) {
      return;
    }
    (geom as number[][][][]).forEach((polygonList) => {
      polygonList.forEach((polygon) => {
        polygon.forEach(scanArray);
      });
    });
  };

  geometries.forEach(scanGeometry);

  return {
    lowerLeft: [llx, lly],
    upperRight: [urx, ury],
  };
};

/**
 * Get planting site bounding box
 */
const getPlantingSiteBoundingBox = (mapData: MapData): MapBoundingBox => {
  const site: MapSourceBaseData = mapData.site ?? { id: 'site', entities: [] };
  const zones: MapSourceBaseData = mapData.zone ?? { id: 'zone', entities: [] };
  const subzones: MapSourceBaseData = mapData.subzone ?? { id: 'subzone', entities: [] };
  const permanentPlots: MapSourceBaseData = mapData.permanentPlot ?? { id: 'permanentPlot', entities: [] };
  const temporaryPlots: MapSourceBaseData = mapData.temporaryPlot ?? { id: 'temporaryPlot', entities: [] };
  const adHocPlots: MapSourceBaseData = mapData.adHocPlot ?? { id: 'adHocPlot', entities: [] };

  const geometries: MapGeometry[] = [
    ...(site?.entities.map((s) => s.boundary) || []),
    ...(zones?.entities.map((s) => s.boundary) || []),
    ...(subzones?.entities.map((s) => s.boundary) || []),
    ...(permanentPlots?.entities.map((s) => s.boundary) || []),
    ...(temporaryPlots?.entities.map((s) => s.boundary) || []),
    ...(adHocPlots?.entities.map((s) => s.boundary) || []),
  ].filter((g) => g);

  return getBoundingBox(geometries);
};

/**
 * Helper util
 */
const getPolygons = (boundary?: MultiPolygon): MapGeometry => {
  if (!boundary) {
    return [];
  }
  return boundary.coordinates;
};

/**
 * Transform planting site geometry data into UI model
 */
const extractPlantingSite = (site: MinimalPlantingSite): MapSourceBaseData => {
  const { id, name, description, boundary } = site;

  return {
    entities: [
      {
        properties: { id, name, description, type: 'site' },
        boundary: getPolygons(boundary),
        id,
      },
    ],
    id: 'sites',
  };
};

/**
 * Transform planting site geometry data into UI model
 */
const extractPlantingSiteFromHistory = (site: MinimalPlantingSite, history: PlantingSiteHistory): MapSourceBaseData => {
  const { name, description } = site;
  const { id, boundary } = history;

  return {
    entities: [
      {
        properties: { id, name, description, type: 'site' },
        boundary: getPolygons(boundary),
        id,
      },
    ],
    id: 'sites',
  };
};

/**
 * Transform planting sites geometry data into UI model
 */
const extractPlantingSites = (sites: MinimalPlantingSite[]): MapSourceBaseData => {
  const sitesEntities: MapEntity[] = [];
  sites.forEach((ps) => {
    const { id, name, description, boundary } = ps;
    sitesEntities.push({
      properties: { id, name, description, type: 'site' },
      boundary: getPolygons(boundary),
      id,
    });
  });

  return {
    entities: sitesEntities,
    id: 'sites',
  };
};

/**
 * Transform multiple sites zones geometry data into UI model
 */
const extractPlantingZonesFromSites = (sites: MinimalPlantingSite[]): MapSourceBaseData => {
  const zonesEntities: MapEntity[] = [];

  sites.forEach((ps) => {
    const zonesData = ps.plantingZones?.map((zone) => {
      const { id, name, boundary } = zone;
      return {
        properties: { id, name, type: 'zone', recency: 0 },
        boundary: getPolygons(boundary),
        id,
      };
    });
    if (zonesData) {
      zonesEntities.push(...zonesData);
    }
  });

  return {
    entities: zonesEntities,
    id: 'zones',
  };
};

/**
 * Transform zones geometry data into UI model
 */
const extractPlantingZones = (site: MinimalPlantingSite): MapSourceBaseData => {
  const zonesData =
    site.plantingZones?.map((zone) => {
      const { id, name, boundary } = zone;
      return {
        properties: { id, name, type: 'zone', recency: 0 },
        boundary: getPolygons(boundary),
        id,
      };
    }) || [];

  return {
    entities: zonesData,
    id: 'zones',
  };
};

/**
 * Transform zones geometry data into UI model
 */
const extractPlantingZonesFromHistory = (site: PlantingSiteHistory): MapSourceBaseData => {
  const zonesData =
    site.plantingZones?.map((zone) => {
      const { id, plantingZoneId, name, boundary } = zone;
      return {
        properties: { id: plantingZoneId, name, type: 'zone', recency: 0 },
        boundary: getPolygons(boundary),
        id: plantingZoneId ?? id,
      };
    }) || [];

  return {
    entities: zonesData,
    id: 'zones',
  };
};

/**
 * Transform multiple sites subzones geometry data into UI model
 */
const extractSubzonesFromSites = (sites: MinimalPlantingSite[]): MapSourceBaseData => {
  const subzoneEntities: MapEntity[] = [];

  sites.forEach((ps) => {
    const allPlantingSubzonesData = ps.plantingZones?.flatMap((zone) => {
      const { plantingSubzones } = zone;
      return plantingSubzones.map((subzone) => {
        const { id, name, fullName, boundary } = subzone;
        return {
          properties: { id, name, fullName, type: 'subzone', zoneId: zone.id },
          boundary: getPolygons(boundary),
          id,
        };
      });
    });
    if (allPlantingSubzonesData) {
      subzoneEntities.push(...allPlantingSubzonesData);
    }
  });

  return {
    entities: subzoneEntities,
    id: 'subzones',
  };
};

/**
 * Transform subzones geometry data into UI model
 */
const extractSubzones = (site: MinimalPlantingSite): MapSourceBaseData => {
  const allPlantingSubzonesData =
    site.plantingZones?.flatMap((zone) => {
      const { plantingSubzones } = zone;
      return plantingSubzones.map((subzone) => {
        const { id, name, fullName, boundary } = subzone;
        return {
          properties: { id, name, fullName, type: 'subzone', zoneId: zone.id },
          boundary: getPolygons(boundary),
          id,
        };
      });
    }) || [];

  return {
    entities: allPlantingSubzonesData.flatMap((f) => f),
    id: 'subzones',
  };
};

const extractSubzonesFromHistory = (site: PlantingSiteHistory): MapSourceBaseData => {
  const allPlantingSubzonesData =
    site.plantingZones?.flatMap((zone) => {
      const { plantingSubzones } = zone;
      return plantingSubzones.map((subzone) => {
        const { id, name, fullName, boundary } = subzone;
        return {
          properties: { id, name, fullName, type: 'subzone', zoneId: zone.id },
          boundary: getPolygons(boundary),
          id,
        };
      });
    }) || [];

  return {
    entities: allPlantingSubzonesData.flatMap((f) => f),
    id: 'subzones',
  };
};

const extractSubzonesFromHistoryAndResult = (
  history: PlantingSiteHistory,
  result: ObservationSummary
): MapSourceBaseData => {
  const latestTime = result.latestObservationTime;
  const allPlantingSubzonesData =
    history.plantingZones?.flatMap((zoneHistory) => {
      const { plantingZoneId, plantingSubzones } = zoneHistory;
      const zoneResult = result.plantingZones.find((_zone) => _zone.plantingZoneId === plantingZoneId);
      return plantingSubzones.map((subzoneHistory) => {
        const { id, plantingSubzoneId, name, fullName, boundary } = subzoneHistory;
        const subzoneResult = zoneResult?.plantingSubzones?.find(
          (_subzone) => _subzone.plantingSubzoneId === plantingSubzoneId
        );
        const recency = subzoneResult?.completedTime === latestTime ? 1 : 0;
        const mortalityRate = subzoneResult?.mortalityRate;
        return {
          properties: { id, name, fullName, type: 'subzone', zoneId: plantingZoneId, recency, mortalityRate },
          boundary: getPolygons(boundary),
          id,
        };
      });
    }) || [];

  return {
    entities: allPlantingSubzonesData.flatMap((f) => f),
    id: 'subzones',
  };
};

/**
 * Get boundary polygons for a map entity
 */
const getMapEntityGeometry = (entity: MapEntity): MapGeometry => {
  if (!entity.boundary || !Array.isArray(entity.boundary)) {
    return [];
  }

  const multiPolygons = (entity.boundary as number[][][][])
    .map((geom) => {
      if (!Array.isArray(geom)) {
        return null;
      }
      return geom;
    })
    .filter((geom) => !!geom) as number[][][][];

  return multiPolygons;
};

/**
 * Extract Planting Sites, Zones, Subzones from planting sites data
 */
const getMapDataFromPlantingSites = (plantingSites: PlantingSite[]): MapData => {
  return {
    site: extractPlantingSites(plantingSites),
    zone: extractPlantingZonesFromSites(plantingSites),
    subzone: extractSubzonesFromSites(plantingSites),
    permanentPlot: undefined,
    temporaryPlot: undefined,
    adHocPlot: undefined,
  };
};

/**
 * Extract Planting Site, Zones, Subzones from planting site data
 */
const getMapDataFromPlantingSite = (plantingSite: MinimalPlantingSite): MapData => {
  return {
    site: extractPlantingSite(plantingSite),
    zone: extractPlantingZones(plantingSite),
    subzone: extractSubzones(plantingSite),
    permanentPlot: undefined,
    temporaryPlot: undefined,
    adHocPlot: undefined,
  };
};

/**
 * Extract Planting Site, Zones, Subzones from planting site data
 */
const getMapDataFromPlantingSiteHistory = (plantingSite: PlantingSite, history: PlantingSiteHistory): MapData => {
  return {
    site: extractPlantingSiteFromHistory(plantingSite, history),
    zone: extractPlantingZonesFromHistory(history),
    subzone: extractSubzonesFromHistory(history),
    permanentPlot: undefined,
    temporaryPlot: undefined,
    adHocPlot: undefined,
  };
};

/**
 * Extract Planting Site, Zones, Subzones from planting site data and results
 */
const getMapDataFromPlantingSiteFromHistoryAndResults = (
  plantingSite: PlantingSite,
  history: PlantingSiteHistory,
  result: ObservationSummary
): MapData => {
  return {
    site: extractPlantingSiteFromHistory(plantingSite, history),
    zone: extractPlantingZonesFromHistory(history),
    subzone: extractSubzonesFromHistoryAndResult(history, result),
    permanentPlot: undefined,
    temporaryPlot: undefined,
    adHocPlot: undefined,
  };
};

/**
 * Extract Planting Site, Zones, Subzones, and Plots from an ObservationResult
 */
const getMapDataFromObservation = (
  observation: ObservationResultsWithLastObv | AdHocObservationResults,
  plantingSiteHistory: PlantingSiteHistory
): MapData => {
  const plantingSiteEntities = [
    {
      id: observation.plantingSiteId,
      properties: {
        id: observation.plantingSiteId,
        name: observation.plantingSiteName,
        type: 'site',
      },
      boundary: getPolygons(plantingSiteHistory.boundary),
    },
  ];

  const plantingSiteHistoryZones = plantingSiteHistory.plantingZones.filter((z) => z.plantingZoneId !== undefined);
  const zoneEntities = plantingSiteHistoryZones.map((zone) => {
    const zoneFromObservation = observation.plantingZones.find((pz) => pz.plantingZoneName === zone.name);
    return {
      // -1 should never be set because undefined ids are filtered before
      id: zone.plantingZoneId || -1,
      properties: {
        id: zone.plantingZoneId || -1,
        name: zoneFromObservation?.plantingZoneName || zone.name || '',
        type: 'zone',
        mortalityRate: zoneFromObservation?.mortalityRate,
        hasObservedPermanentPlots: zoneFromObservation?.hasObservedPermanentPlots,
      },
      boundary: getPolygons(zone.boundary),
    };
  });

  const plantingSiteHistorySubZones = plantingSiteHistoryZones
    .flatMap((z) => z.plantingSubzones.flatMap((subz) => ({ ...subz, zoneName: z.name })))
    .filter((subz) => subz.name !== undefined);
  const subzoneEntities = plantingSiteHistorySubZones?.map((subzone) => {
    const zoneFromObservation = observation.plantingZones.find((pz) => pz.name === subzone.zoneName);
    const subzoneFromObservation = zoneFromObservation?.plantingSubzones?.find(
      (sz) => sz.plantingSubzoneName === subzone.name
    );
    return {
      // -1 should never be set because undefined ids are filtered before
      id: subzone.plantingSubzoneId || -1,
      properties: {
        id: subzone.plantingSubzoneId || -1,
        name: subzoneFromObservation?.plantingSubzoneName || subzone.name || '',
        mortalityRate: zoneFromObservation?.mortalityRate,
        type: 'subzone',
      },
      boundary: getPolygons(subzone.boundary),
      lastObv: subzoneFromObservation?.lastObv,
    };
  });
  const subzoneEntitiesWithRecency = () => {
    const orderedSubzoneEntities = subzoneEntities?.sort((a, b) => {
      // Check for undefined and compare valid dates
      if (a.lastObv && b.lastObv) {
        return isAfter(b.lastObv, a.lastObv) ? 1 : -1;
      }
      return 0; // In case both are undefined (should not happen here)
    });

    const entitiesToReturn: {
      properties: { recency: number; id: number; name: string; type: string };
      id: number;
      boundary: MapGeometry;
      lastObv: string | undefined;
    }[] = [];
    let lastProcecedDate = orderedSubzoneEntities?.[0]?.lastObv;
    let recencyToSet = 1;

    orderedSubzoneEntities?.forEach((entity) => {
      if (entity.lastObv !== lastProcecedDate) {
        recencyToSet = recencyToSet + 1;
        lastProcecedDate = entity.lastObv;
      }

      entitiesToReturn.push({
        ...entity,
        properties: { ...entity.properties, recency: recencyToSet },
      });
    });

    return entitiesToReturn;
  };

  const permanentPlotEntities = observation.plantingZones.flatMap((zone: ObservationPlantingZoneResults) =>
    zone.plantingSubzones.flatMap((sz: ObservationPlantingSubzoneResults) =>
      getMonitoringPlotMapData(sz.monitoringPlots, true)
    )
  );

  const temporaryPlotEntities = observation.plantingZones.flatMap((zone: ObservationPlantingZoneResults) =>
    zone.plantingSubzones.flatMap((sz: ObservationPlantingSubzoneResults) =>
      getMonitoringPlotMapData(sz.monitoringPlots, false)
    )
  );

  const adHocPlot = observation.adHocPlot;
  const addHocPlotEntities = adHocPlot
    ? [
        {
          id: adHocPlot.monitoringPlotId,
          properties: {
            id: adHocPlot.monitoringPlotId,
            name: adHocPlot.monitoringPlotNumber,
            type: 'adHocPlot',
          },
          boundary: [adHocPlot.boundary.coordinates],
        },
      ]
    : [];

  return {
    site: { id: 'sites', entities: plantingSiteEntities },
    zone: { id: 'zones', entities: zoneEntities || [] },
    subzone: { id: 'subzones', entities: subzoneEntitiesWithRecency() },
    permanentPlot: { id: 'permanentPlots', entities: permanentPlotEntities },
    temporaryPlot: { id: 'temporaryPlots', entities: temporaryPlotEntities },
    adHocPlot: { id: 'adHocPlots', entities: addHocPlotEntities },
  };
};

// private util
const getMonitoringPlotMapData = (
  monitoringPlots: (ObservationMonitoringPlotResults | ObservationMonitoringPlotResultsPayload)[],
  permanent: boolean
) =>
  monitoringPlots
    .filter((plot) => plot.isPermanent === permanent)
    .map((plot) => ({
      id: plot.monitoringPlotId,
      properties: {
        id: plot.monitoringPlotId,
        name: plot.monitoringPlotNumber,
        type: permanent ? 'permanentPlot' : 'temporaryPlot',
      },
      boundary: [plot.boundary.coordinates],
    }));

/**
 * Exported functions
 */
const MapService = {
  getMapboxToken,
  getBoundingBox,
  getMapDataFromPlantingSite,
  getMapDataFromPlantingSites,
  getMapDataFromPlantingSiteHistory,
  getMapDataFromPlantingSiteFromHistoryAndResults,
  getMapDataFromObservation,
  getPlantingSiteBoundingBox,
  getMapEntityGeometry,
  extractPlantingSite,
  extractPlantingSiteFromHistory,
  extractPlantingZones,
  extractPlantingZonesFromHistory,
  extractSubzones,
  extractSubzonesFromHistory,
};

export default MapService;
