import area from '@turf/area';
import union from '@turf/union';
import { Feature, FeatureCollection, Polygon } from 'geojson';
import { DateTime } from 'luxon';

import { paths } from 'src/api/types/generated-schema';
import { MapBoundingBox, MapData, MapEntity, MapGeometry, MapSourceBaseData } from 'src/types/Map';
import {
  AdHocObservationResults,
  ObservationMonitoringPlotResults,
  ObservationMonitoringPlotResultsPayload,
  ObservationResultsWithLastObv,
  ObservationStratumResults,
  ObservationSubstratumResults,
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
 * Return recency number based on time
 */
const getRecencyFromTime = (time: string): number => {
  const date = DateTime.fromISO(time);

  const diff = date.diffNow(['months']);
  const months = -diff.months;

  if (months < 3) {
    return 1;
  } else if (months < 6) {
    return 2;
  } else if (months < 12) {
    return 3;
  } else if (months < 18) {
    return 4;
  } else {
    return 5;
  }
};

/**
 * Get planting site bounding box
 */
const getPlantingSiteBoundingBox = (mapData: MapData): MapBoundingBox => {
  const site: MapSourceBaseData = mapData.site ?? { id: 'site', entities: [] };
  const zones: MapSourceBaseData = mapData.stratum ?? { id: 'zone', entities: [] };
  const subzones: MapSourceBaseData = mapData.substratum ?? { id: 'subzone', entities: [] };
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
    const zonesData = ps.strata?.map((zone) => {
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
    site.strata?.map((zone) => {
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
    site.strata?.map((zone) => {
      const { id, stratumId, name, boundary } = zone;
      return {
        properties: { id, stratumId, name, type: 'zone', recency: 0 },
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
 * Transform multiple sites subzones geometry data into UI model
 */
const extractSubzonesFromSites = (sites: MinimalPlantingSite[]): MapSourceBaseData => {
  const subzoneEntities: MapEntity[] = [];

  sites.forEach((ps) => {
    const allPlantingSubzonesData = ps.strata?.flatMap((zone) => {
      const { substrata } = zone;
      return substrata.map((subzone) => {
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
    site.strata?.flatMap((zone) => {
      const { substrata } = zone;
      return substrata.map((subzone) => {
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
    site.strata?.flatMap((zone) => {
      const { substrata } = zone;
      return substrata.map((subzone) => {
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
  site: PlantingSite,
  history: PlantingSiteHistory,
  result: ObservationSummary
): MapSourceBaseData => {
  const allPlantingSubzonesData =
    history.strata?.flatMap((zoneHistory) => {
      const { stratumId, substrata } = zoneHistory;
      const zone = site.strata?.find((_zone) => _zone.id === stratumId);
      const zoneResult = result.strata.find((_zone) => _zone.stratumId === stratumId);
      return substrata.map((subzoneHistory) => {
        const { id, substratumId, name, fullName, boundary } = subzoneHistory;
        const subzone = zone?.substrata?.find((_subzone) => _subzone.id === substratumId);
        const subzoneResult = zoneResult?.substrata?.find((_subzone) => _subzone.substratumId === substratumId);
        const recency = subzone?.latestObservationCompletedTime
          ? getRecencyFromTime(subzone.latestObservationCompletedTime)
          : -1;
        const survivalRate = subzoneResult?.survivalRate;
        return {
          properties: { id, name, fullName, type: 'subzone', zoneId: stratumId, recency, survivalRate },
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

const getMapDataFromGisPlantingSites = (gisPlantingSiteData: FeatureCollection<MultiPolygon>): MapData => {
  const siteData = extractPlantingSitesFromGis(gisPlantingSiteData);
  const zoneData = extractZonesFromGis(gisPlantingSiteData);
  const subzoneData = extractSubzonesFromGis(gisPlantingSiteData);

  return {
    site: siteData,
    stratum: zoneData,
    substratum: subzoneData,
    permanentPlot: undefined,
    temporaryPlot: undefined,
    adHocPlot: undefined,
  };
};

const processFeatures = (features: Feature<MultiPolygon>[], siteId?: string, siteIndex?: number, skipUnion = false) => {
  const siteName = siteId || features[0]?.properties?.site || features[0]?.properties?.boundary_name;
  let unionedFeature: Feature<Polygon | MultiPolygon>;
  let boundaryCoordinates: MapGeometry;
  let totalArea: string;

  // For map rendering, we can often skip the expensive union operation
  // and just use the individual feature boundaries
  if (skipUnion || features.length === 1) {
    // Use the first feature for basic properties, but combine all boundaries for rendering
    unionedFeature = features[0] ?? undefined;

    // Combine all feature boundaries without union (much faster)
    const allBoundaries = features.map((f) => getPolygons(f.geometry)).flat();
    boundaryCoordinates = allBoundaries;

    // Calculate total area by summing individual areas (faster than union+area)
    const totalAreaNum = features.reduce((sum, feature) => sum + area(feature) / 10_000, 0);
    totalArea = totalAreaNum.toFixed(2);
  } else {
    // Only do expensive union when absolutely necessary
    unionedFeature = features[0] ?? undefined;
    for (let i = 1; i < features.length; i++) {
      const result = union(unionedFeature, features[i]);
      if (result) {
        unionedFeature = result;
      }
    }

    const unionedBoundary = unionedFeature.geometry;
    boundaryCoordinates = getPolygons(unionedBoundary as MultiPolygon);
    totalArea = (area(unionedFeature) / 10_000).toFixed(2);
  }

  const firstFeature = features[0];

  // Generate numeric ID from site name
  const siteNameForId = siteName || firstFeature.properties?.boundary_name;
  const numericId = siteNameForId
    ? Math.abs(siteNameForId.split('').reduce((a: number, b: string, i: number) => a + b.charCodeAt(0) * (i + 1), 0)) ||
      (siteIndex ?? 0)
    : siteIndex ?? 0;

  return {
    properties: {
      id: numericId,
      name: siteName,
      type: 'site',
    },
    boundary: boundaryCoordinates,
    id: numericId,
    totalArea,
  };
};

const calculateAreaFromGisData = (gisPlantingSiteData: FeatureCollection<MultiPolygon>) => {
  // For area calculation, we can skip union and just sum individual areas (much faster)
  const processedFeatures = processFeatures(gisPlantingSiteData.features, undefined, 0, true);
  return processedFeatures.totalArea;
};

const extractPlantingSitesFromGis = (gisPlantingSiteData: FeatureCollection<MultiPolygon>): MapSourceBaseData => {
  const plantingSitesData: {
    properties: {
      id: number;
      name: any;
      type: string;
    };
    boundary: MapGeometry;
    id: number;
  }[] = [];

  const groupedByPlantingSite = gisPlantingSiteData.features?.reduce((groups: { [key: string]: any[] }, feature) => {
    const site = feature.properties?.site;
    if (site) {
      if (!groups[site]) {
        groups[site] = [];
      }
      groups[site].push(feature);
    }
    return groups;
  }, {});

  if (groupedByPlantingSite && Object.keys(groupedByPlantingSite).length > 0) {
    Object.keys(groupedByPlantingSite).forEach((site, index) => {
      const features = groupedByPlantingSite[site] as Feature<MultiPolygon>[];
      // Skip union for map rendering - individual boundaries work fine for display
      plantingSitesData.push(processFeatures(features, site, index, true));
    });
  } else {
    const allFeatures = gisPlantingSiteData.features;
    if (allFeatures) {
      // Skip union for map rendering
      plantingSitesData.push(processFeatures(allFeatures, undefined, 0, true));
    }
  }

  return {
    entities: plantingSitesData,
    id: 'sites',
  };
};

const extractZonesFromGis = (gisPlantingSiteData: FeatureCollection): MapSourceBaseData => {
  const zonesData: {
    properties: {
      id: number;
      name: any;
      type: string;
    };
    boundary: MapGeometry;
    id: number;
    totalArea: number;
  }[] = [];

  const groupedByStrata = gisPlantingSiteData.features?.reduce((groups: { [key: string]: any[] }, feature) => {
    const strata = feature.properties?.strata;
    if (strata) {
      if (!groups[strata]) {
        groups[strata] = [];
      }
      groups[strata].push(feature);
    }
    return groups;
  }, {});

  if (groupedByStrata) {
    Object.keys(groupedByStrata).forEach((strata, index) => {
      const features = groupedByStrata[strata] as Feature<MultiPolygon>[];

      // Combine boundaries without union (much faster)
      const allBoundaries = features.map((f) => getPolygons(f.geometry)).flat();
      const boundaryCoordinates = allBoundaries;

      // Calculate total area by summing individual areas (faster than union+area)
      const totalAreaNum = features.reduce((sum, feature) => sum + area(feature) / 10_000, 0);
      const totalArea = totalAreaNum.toFixed(2);

      const firstFeature = groupedByStrata[strata][0];
      // Generate a unique numeric ID using a simple hash of the strata name or use index
      const numericId =
        Math.abs(strata.split('').reduce((a: number, b: string, i: number) => a + b.charCodeAt(0) * (i + 1), 0)) ||
        index;

      zonesData.push({
        properties: {
          id: numericId,
          name: firstFeature.properties?.strata,
          type: 'zone',
        },
        boundary: boundaryCoordinates,
        id: numericId,
        totalArea: Number(totalArea),
      });
    });
  }

  return {
    entities: zonesData,
    id: 'zones',
  };
};

const extractSubzonesFromGis = (gisPlantingSiteData: FeatureCollection): MapSourceBaseData => {
  const allPlantingSubzonesData =
    gisPlantingSiteData.features?.map((subzone) => {
      const { properties, geometry } = subzone;
      const totalArea = (area(subzone) / 10_000).toFixed(2);
      return {
        properties: {
          id: Number(properties?.fid),
          name: properties?.substrata,
          fullName: properties?.substrata,
          type: 'subzone',
          zoneId: properties?.strata,
        },
        boundary: getPolygons(geometry as MultiPolygon),
        id: Number(properties?.fid),
        totalArea: Number(totalArea),
      };
    }) || [];

  return {
    entities: allPlantingSubzonesData,
    id: 'subzones',
  };
};

/**
 * Extract Planting Sites, Zones, Subzones from planting sites data
 */
const getMapDataFromPlantingSites = (plantingSites: PlantingSite[]): MapData => {
  return {
    site: extractPlantingSites(plantingSites),
    stratum: extractPlantingZonesFromSites(plantingSites),
    substratum: extractSubzonesFromSites(plantingSites),
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
    stratum: extractPlantingZones(plantingSite),
    substratum: extractSubzones(plantingSite),
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
    stratum: extractPlantingZonesFromHistory(history),
    substratum: extractSubzonesFromHistory(history),
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
    stratum: extractPlantingZonesFromHistory(history),
    substratum: extractSubzonesFromHistoryAndResult(plantingSite, history, result),
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

  const plantingSiteHistoryZones = plantingSiteHistory.strata.filter((z) => z.stratumId !== undefined);
  const zoneEntities = plantingSiteHistoryZones.map((zone) => {
    const zoneFromObservation = observation.strata.find((pz) => pz.stratumName === zone.name);
    return {
      // -1 should never be set because undefined ids are filtered before
      id: zone.stratumId || -1,
      properties: {
        id: zone.stratumId || -1,
        name: zoneFromObservation?.stratumName || zone.name || '',
        type: 'zone',
        survivalRate: zoneFromObservation?.survivalRate,
        hasObservedPermanentPlots: zoneFromObservation?.hasObservedPermanentPlots,
      },
      boundary: getPolygons(zone.boundary),
    };
  });

  const plantingSiteHistorySubZones = plantingSiteHistoryZones
    .flatMap((z) => z.substrata.flatMap((subz) => ({ ...subz, zoneName: z.name })))
    .filter((subz) => subz.name !== undefined);
  const subzoneEntities = plantingSiteHistorySubZones?.map((subzone) => {
    const zoneFromObservation = observation.strata.find((pz) => pz.name === subzone.zoneName);
    const subzoneFromObservation = zoneFromObservation?.substrata?.find((sz) => sz.substratumName === subzone.name);
    return {
      // -1 should never be set because undefined ids are filtered before
      id: subzone.substratumId || -1,
      properties: {
        id: subzone.substratumId || -1,
        name: subzoneFromObservation?.substratumName || subzone.name || '',
        survivalRate: zoneFromObservation?.survivalRate,
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

  const permanentPlotEntities = observation.strata.flatMap((zone: ObservationStratumResults) =>
    zone.substrata.flatMap((sz: ObservationSubstratumResults) => getMonitoringPlotMapData(sz.monitoringPlots, true))
  );

  const temporaryPlotEntities = observation.strata.flatMap((zone: ObservationStratumResults) =>
    zone.substrata.flatMap((sz: ObservationSubstratumResults) => getMonitoringPlotMapData(sz.monitoringPlots, false))
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
    stratum: { id: 'zones', entities: zoneEntities || [] },
    substratum: { id: 'subzones', entities: subzoneEntitiesWithRecency() },
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
  getMapDataFromGisPlantingSites,
  getMapDataFromPlantingSite,
  getMapDataFromPlantingSites,
  getMapDataFromPlantingSiteHistory,
  getMapDataFromPlantingSiteFromHistoryAndResults,
  getMapDataFromObservation,
  getPlantingSiteBoundingBox,
  getMapEntityGeometry,
  getRecencyFromTime,
  extractPlantingSite,
  extractPlantingSiteFromHistory,
  extractPlantingZones,
  extractPlantingZonesFromHistory,
  extractSubzones,
  extractSubzonesFromHistory,
  calculateAreaFromGisData,
};

export default MapService;
