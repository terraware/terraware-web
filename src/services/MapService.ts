import { paths } from 'src/api/types/generated-schema';
import { MultiPolygon, PlantingSite } from 'src/types/Tracking';
import { MapBoundingBox, MapEntity, MapGeometry, MapSourceBaseData } from 'src/types/Map';
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
const getPlantingSiteBoundingBox = (plantingSite: PlantingSite): MapBoundingBox => {
  const site: MapSourceBaseData = extractPlantingSite(plantingSite);
  const zones: MapSourceBaseData = extractPlantingZones(plantingSite);
  const plots: MapSourceBaseData = extractPlots(plantingSite);

  const geometries: MapGeometry[] = [
    site.entities[0]?.boundary,
    ...(zones?.entities.map((s) => s.boundary) || []),
    ...(plots?.entities.map((s) => s.boundary) || []),
  ].filter((g) => g) as MapGeometry[];

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
const extractPlantingSite = (site: PlantingSite): MapSourceBaseData => {
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
 * Transform zones geometry data into UI model
 */
const extractPlantingZones = (site: PlantingSite): MapSourceBaseData => {
  const zonesData =
    site.plantingZones?.map((zone) => {
      const { id, name, boundary } = zone;
      return {
        properties: { id, name, type: 'zone' },
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
 * Transform plots geometry data into UI model
 */
const extractPlots = (site: PlantingSite): MapSourceBaseData => {
  const allPlotsData =
    site.plantingZones?.flatMap((zone) => {
      const { plots } = zone;
      return plots.map((plot) => {
        const { id, name, fullName, boundary } = plot;
        return {
          properties: { id, name, fullName, type: 'plot' },
          boundary: getPolygons(boundary),
          id,
        };
      });
    }) || [];

  return {
    entities: allPlotsData.flatMap((f) => f),
    id: 'plots',
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
      return geom as number[][][];
    })
    .filter((geom) => !!geom) as number[][][][];

  return multiPolygons;
};

/**
 * Exported functions
 */
const MapService = {
  getMapboxToken,
  getBoundingBox,
  getPlantingSiteBoundingBox,
  getMapEntityGeometry,
  extractPlantingSite,
  extractPlantingZones,
  extractPlots,
};

export default MapService;
