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
  const strata: MapSourceBaseData = mapData.stratum ?? { id: 'stratum', entities: [] };
  const substrata: MapSourceBaseData = mapData.substratum ?? { id: 'substratum', entities: [] };
  const permanentPlots: MapSourceBaseData = mapData.permanentPlot ?? { id: 'permanentPlot', entities: [] };
  const temporaryPlots: MapSourceBaseData = mapData.temporaryPlot ?? { id: 'temporaryPlot', entities: [] };
  const adHocPlots: MapSourceBaseData = mapData.adHocPlot ?? { id: 'adHocPlot', entities: [] };

  const geometries: MapGeometry[] = [
    ...(site?.entities.map((_site) => _site.boundary) || []),
    ...(strata?.entities.map((_stratum) => _stratum.boundary) || []),
    ...(substrata?.entities.map((_substratum) => _substratum.boundary) || []),
    ...(permanentPlots?.entities.map((_plot) => _plot.boundary) || []),
    ...(temporaryPlots?.entities.map((_plot) => _plot.boundary) || []),
    ...(adHocPlots?.entities.map((_plot) => _plot.boundary) || []),
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
 * Transform multiple sites strata geometry data into UI model
 */
const extractStrataFromSites = (sites: MinimalPlantingSite[]): MapSourceBaseData => {
  const strataEntities: MapEntity[] = [];

  sites.forEach((ps) => {
    const strataData = ps.strata?.map((stratum) => {
      const { id, name, boundary } = stratum;
      return {
        properties: { id, name, type: 'stratum', recency: 0 },
        boundary: getPolygons(boundary),
        id,
      };
    });
    if (strataData) {
      strataEntities.push(...strataData);
    }
  });

  return {
    entities: strataEntities,
    id: 'strata',
  };
};

/**
 * Transform strata geometry data into UI model
 */
const extractStrata = (site: MinimalPlantingSite): MapSourceBaseData => {
  const strataData =
    site.strata?.map((stratum) => {
      const { id, name, boundary } = stratum;
      return {
        properties: { id, name, type: 'stratum', recency: 0 },
        boundary: getPolygons(boundary),
        id,
      };
    }) || [];

  return {
    entities: strataData,
    id: 'strata',
  };
};

/**
 * Transform strata geometry data into UI model
 */
const extractStrataFromHistory = (site: PlantingSiteHistory): MapSourceBaseData => {
  const strataData =
    site.strata?.map((stratum) => {
      const { id, stratumId, name, boundary } = stratum;
      return {
        properties: { id, stratumId, name, type: 'stratum', recency: 0 },
        boundary: getPolygons(boundary),
        id,
      };
    }) || [];

  return {
    entities: strataData,
    id: 'strata',
  };
};

/**
 * Transform multiple sites substrata geometry data into UI model
 */
const extractSubstrataFromSites = (sites: MinimalPlantingSite[]): MapSourceBaseData => {
  const substratumEntities: MapEntity[] = [];

  sites.forEach((ps) => {
    const allSubstrataData = ps.strata?.flatMap((stratum) => {
      const { substrata } = stratum;
      return substrata.map((substratum) => {
        const { id, name, fullName, boundary } = substratum;
        return {
          properties: { id, name, fullName, type: 'substratum', stratumId: stratum.id },
          boundary: getPolygons(boundary),
          id,
        };
      });
    });
    if (allSubstrataData) {
      substratumEntities.push(...allSubstrataData);
    }
  });

  return {
    entities: substratumEntities,
    id: 'substrata',
  };
};

/**
 * Transform substrata geometry data into UI model
 */
const extractSubstrata = (site: MinimalPlantingSite): MapSourceBaseData => {
  const allSubstrataData =
    site.strata?.flatMap((stratum) => {
      const { substrata } = stratum;
      return substrata.map((substratum) => {
        const { id, name, fullName, boundary } = substratum;
        return {
          properties: { id, name, fullName, type: 'substratum', stratumId: stratum.id, stratumName: stratum.name },
          boundary: getPolygons(boundary),
          id,
        };
      });
    }) || [];

  return {
    entities: allSubstrataData.flatMap((f) => f),
    id: 'substrata',
  };
};

const extractSubstrataFromHistory = (site: PlantingSiteHistory): MapSourceBaseData => {
  const allSubstrataData =
    site.strata?.flatMap((stratum) => {
      const { substrata } = stratum;
      return substrata.map((substratum) => {
        const { id, name, fullName, boundary } = substratum;
        return {
          properties: { id, name, fullName, type: 'substratum', stratumId: stratum.id },
          boundary: getPolygons(boundary),
          id,
        };
      });
    }) || [];

  return {
    entities: allSubstrataData.flatMap((f) => f),
    id: 'substrata',
  };
};

const extractSubstrataFromHistoryAndResult = (
  site: PlantingSite,
  history: PlantingSiteHistory,
  result: ObservationSummary
): MapSourceBaseData => {
  const allSubstrataData =
    history.strata?.flatMap((stratumHistory) => {
      const { stratumId, substrata } = stratumHistory;
      const stratum = site.strata?.find((_stratum) => _stratum.id === stratumId);
      const stratumResult = result.strata.find((_stratum) => _stratum.stratumId === stratumId);
      return substrata.map((substratumHistory) => {
        const { id, substratumId, name, fullName, boundary } = substratumHistory;
        const substratum = stratum?.substrata?.find((_substratum) => _substratum.id === substratumId);
        const substratumResult = stratumResult?.substrata?.find(
          (_substratum) => _substratum.substratumId === substratumId
        );
        const recency = substratum?.latestObservationCompletedTime
          ? getRecencyFromTime(substratum.latestObservationCompletedTime)
          : -1;
        const survivalRate = substratumResult?.survivalRate;
        return {
          properties: { id, name, fullName, type: 'substratum', stratumId, recency, survivalRate },
          boundary: getPolygons(boundary),
          id,
        };
      });
    }) || [];

  return {
    entities: allSubstrataData.flatMap((f) => f),
    id: 'substrata',
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
  const stratumData = extractStrataFromGis(gisPlantingSiteData);
  const substratumData = extractSubstrataFromGis(gisPlantingSiteData);

  return {
    site: siteData,
    stratum: stratumData,
    substratum: substratumData,
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

const extractStrataFromGis = (gisPlantingSiteData: FeatureCollection): MapSourceBaseData => {
  const strataData: {
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

      strataData.push({
        properties: {
          id: numericId,
          name: firstFeature.properties?.strata,
          type: 'stratum',
        },
        boundary: boundaryCoordinates,
        id: numericId,
        totalArea: Number(totalArea),
      });
    });
  }

  return {
    entities: strataData,
    id: 'strata',
  };
};

const extractSubstrataFromGis = (gisPlantingSiteData: FeatureCollection): MapSourceBaseData => {
  const allSubstrataData =
    gisPlantingSiteData.features?.map((substratum) => {
      const { properties, geometry } = substratum;
      const totalArea = (area(substratum) / 10_000).toFixed(2);
      return {
        properties: {
          id: Number(properties?.fid),
          name: properties?.substrata,
          fullName: properties?.substrata,
          type: 'substratum',
          stratumId: properties?.strata,
        },
        boundary: getPolygons(geometry as MultiPolygon),
        id: Number(properties?.fid),
        totalArea: Number(totalArea),
      };
    }) || [];

  return {
    entities: allSubstrataData,
    id: 'substrata',
  };
};

/**
 * Extract Planting Sites, Strata, Substrata from planting sites data
 */
const getMapDataFromPlantingSites = (plantingSites: PlantingSite[]): MapData => {
  return {
    site: extractPlantingSites(plantingSites),
    stratum: extractStrataFromSites(plantingSites),
    substratum: extractSubstrataFromSites(plantingSites),
    permanentPlot: undefined,
    temporaryPlot: undefined,
    adHocPlot: undefined,
  };
};

/**
 * Extract Planting Site, Strata, Substrata from planting site data
 */
const getMapDataFromPlantingSite = (plantingSite: MinimalPlantingSite): MapData => {
  return {
    site: extractPlantingSite(plantingSite),
    stratum: extractStrata(plantingSite),
    substratum: extractSubstrata(plantingSite),
    permanentPlot: undefined,
    temporaryPlot: undefined,
    adHocPlot: undefined,
  };
};

/**
 * Extract Planting Site, Strata, Substrata from planting site data
 */
const getMapDataFromPlantingSiteHistory = (plantingSite: PlantingSite, history: PlantingSiteHistory): MapData => {
  return {
    site: extractPlantingSiteFromHistory(plantingSite, history),
    stratum: extractStrataFromHistory(history),
    substratum: extractSubstrataFromHistory(history),
    permanentPlot: undefined,
    temporaryPlot: undefined,
    adHocPlot: undefined,
  };
};

/**
 * Extract Planting Site, Strata, Substrata from planting site data and results
 */
const getMapDataFromPlantingSiteFromHistoryAndResults = (
  plantingSite: PlantingSite,
  history: PlantingSiteHistory,
  result: ObservationSummary
): MapData => {
  return {
    site: extractPlantingSiteFromHistory(plantingSite, history),
    stratum: extractStrataFromHistory(history),
    substratum: extractSubstrataFromHistoryAndResult(plantingSite, history, result),
    permanentPlot: undefined,
    temporaryPlot: undefined,
    adHocPlot: undefined,
  };
};

/**
 * Extract Planting Site, Strata, Substrata, and Plots from an ObservationResult
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

  const plantingSiteHistoryStrata = plantingSiteHistory.strata.filter((_stratum) => _stratum.stratumId !== undefined);
  const stratumEntities = plantingSiteHistoryStrata.map((stratum) => {
    const stratumFromObservation = observation.strata.find((_stratum) => _stratum.stratumName === stratum.name);
    return {
      // -1 should never be set because undefined ids are filtered before
      id: stratum.stratumId || -1,
      properties: {
        id: stratum.stratumId || -1,
        name: stratumFromObservation?.stratumName || stratum.name || '',
        type: 'stratum',
        survivalRate: stratumFromObservation?.survivalRate,
        hasObservedPermanentPlots: stratumFromObservation?.hasObservedPermanentPlots,
      },
      boundary: getPolygons(stratum.boundary),
    };
  });

  const plantingSiteHistorySubstrata = plantingSiteHistoryStrata
    .flatMap((_stratum) =>
      _stratum.substrata.flatMap((_substratum) => ({ ..._substratum, stratumName: _stratum.name }))
    )
    .filter((_substratum) => _substratum.name !== undefined);
  const substratumEntities = plantingSiteHistorySubstrata?.map((substratum) => {
    const stratumFromObservation = observation.strata.find((_stratum) => _stratum.name === substratum.stratumName);
    const substratumFromObservation = stratumFromObservation?.substrata?.find(
      (_substratum) => _substratum.substratumName === substratum.name
    );
    return {
      // -1 should never be set because undefined ids are filtered before
      id: substratum.substratumId || -1,
      properties: {
        id: substratum.substratumId || -1,
        name: substratumFromObservation?.substratumName || substratum.name || '',
        survivalRate: stratumFromObservation?.survivalRate,
        type: 'substratum',
      },
      boundary: getPolygons(substratum.boundary),
      lastObv: substratumFromObservation?.lastObv,
    };
  });
  const substratumEntitiesWithRecency = () => {
    const orderedSubstratumEntities = substratumEntities?.sort((a, b) => {
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
    let lastProcecedDate = orderedSubstratumEntities?.[0]?.lastObv;
    let recencyToSet = 1;

    orderedSubstratumEntities?.forEach((entity) => {
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

  const permanentPlotEntities = observation.strata.flatMap((stratum: ObservationStratumResults) =>
    stratum.substrata.flatMap((_substratum: ObservationSubstratumResults) =>
      getMonitoringPlotMapData(_substratum.monitoringPlots, true)
    )
  );

  const temporaryPlotEntities = observation.strata.flatMap((stratum: ObservationStratumResults) =>
    stratum.substrata.flatMap((_substratum: ObservationSubstratumResults) =>
      getMonitoringPlotMapData(_substratum.monitoringPlots, false)
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
    stratum: { id: 'strata', entities: stratumEntities || [] },
    substratum: { id: 'substrata', entities: substratumEntitiesWithRecency() },
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
  extractStrata,
  extractStrataFromHistory,
  extractSubstrata,
  extractSubstrataFromHistory,
  calculateAreaFromGisData,
};

export default MapService;
