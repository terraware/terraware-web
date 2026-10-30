import area from '@turf/area';
import { featureCollection } from '@turf/helpers';
import union from '@turf/union';
import { Feature, FeatureCollection, MultiPolygon as GeoJsonMultiPolygon, Polygon } from 'geojson';
import { DateTime } from 'luxon';

import { MapBoundingBox, MapData, MapEntity, MapGeometry, MapSourceBaseData } from 'src/types/Map';
import { MinimalPlantingSite, MultiPolygon } from 'src/types/Tracking';

/**
 * Map related service
 */

/**
 * Exported types
 */

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
    .filter((geom) => !!geom);

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
      const result = union(featureCollection([unionedFeature, features[i] as Feature<GeoJsonMultiPolygon>]));
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
    : (siteIndex ?? 0);

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
 * Exported functions
 */
const MapService = {
  getBoundingBox,
  getMapDataFromGisPlantingSites,
  getMapDataFromPlantingSite,
  getPlantingSiteBoundingBox,
  getMapEntityGeometry,
  getRecencyFromTime,
  extractPlantingSite,
  extractStrata,
  extractSubstrata,
  calculateAreaFromGisData,
};

export default MapService;
