import { paths } from 'src/api/types/generated-schema';
import { MultiPolygon, PlantingSite, MinimalPlantingSite } from 'src/types/Tracking';
import { MapBoundingBox, MapData, MapEntity, MapGeometry, MapSourceBaseData } from 'src/types/Map';
import HttpService, { Response } from './HttpService';
import {
  ObservationMonitoringPlotResultsPayload,
  ObservationMonitoringPlotResults,
  ObservationPlantingSubzoneResults,
  ObservationPlantingZoneResults,
  ObservationResults,
  PlantingSiteAggregation,
  SubzoneAggregation,
  ZoneAggregation,
} from 'src/types/Observations';

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

  const geometries: MapGeometry[] = [
    site.entities[0]?.boundary,
    ...(zones?.entities.map((s) => s.boundary) || []),
    ...(subzones?.entities.map((s) => s.boundary) || []),
    ...(permanentPlots?.entities.map((s) => s.boundary) || []),
    ...(temporaryPlots?.entities.map((s) => s.boundary) || []),
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
 * Transform zones geometry data into UI model
 */
const extractPlantingZones = (site: MinimalPlantingSite): MapSourceBaseData => {
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
 * Transform subzones geometry data into UI model
 */
const extractSubzones = (site: MinimalPlantingSite): MapSourceBaseData => {
  const allPlantingSubzonesData =
    site.plantingZones?.flatMap((zone) => {
      const { plantingSubzones } = zone;
      return plantingSubzones.map((subzone) => {
        const { id, name, fullName, boundary } = subzone;
        return {
          properties: { id, name, fullName, type: 'subzone' },
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
      return geom as number[][][];
    })
    .filter((geom) => !!geom) as number[][][][];

  return multiPolygons;
};

/**
 * Extract Planting Site, Zones, Subzones from planting site data
 */
const getMapDataFromPlantingSite = (plantingSite: PlantingSite): MapData => {
  return {
    site: extractPlantingSite(plantingSite),
    zone: extractPlantingZones(plantingSite),
    subzone: extractSubzones(plantingSite),
    permanentPlot: undefined,
    temporaryPlot: undefined,
  };
};

/**
 * Extract Planting Site, Zones, Subzones, and Plots from an ObservationResult
 */
const getMapDataFromObservation = (observation: ObservationResults): MapData => {
  const plantingSiteEntities = [
    {
      id: observation.plantingSiteId,
      properties: {
        id: observation.plantingSiteId,
        name: observation.plantingSiteName,
        type: 'site',
      },
      boundary: getPolygons(observation.boundary),
    },
  ];

  const zoneEntities = observation.plantingZones.map((zone: ObservationPlantingZoneResults) => ({
    id: zone.plantingZoneId,
    properties: {
      id: zone.plantingZoneId,
      name: zone.plantingZoneName,
      type: 'zone',
      mortalityRate: zone.mortalityRate,
      hasObservedPermanentPlots: zone.hasObservedPermanentPlots,
    },
    boundary: getPolygons(zone.boundary),
  }));

  const subzoneEntities = observation.plantingZones.flatMap((zone: ObservationPlantingZoneResults) =>
    zone.plantingSubzones.map((sz: ObservationPlantingSubzoneResults) => ({
      id: sz.plantingSubzoneId,
      properties: {
        id: sz.plantingSubzoneId,
        name: sz.plantingSubzoneName,
        type: 'subzone',
      },
      boundary: getPolygons(sz.boundary),
    }))
  );

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

  return {
    site: { id: 'sites', entities: plantingSiteEntities },
    zone: { id: 'zones', entities: zoneEntities },
    subzone: { id: 'subzones', entities: subzoneEntities },
    permanentPlot: { id: 'permanentPlots', entities: permanentPlotEntities },
    temporaryPlot: { id: 'temporaryPlots', entities: temporaryPlotEntities },
  };
};

/**
 * Extract Planting Site, Zones, Subzones and monitoring plots from planting site aggregated data,
 * which is a hybrid of planting site and observation results.
 */
const getMapDataFromAggregation = (plantingSite: PlantingSiteAggregation): MapData => {
  const permanentPlotEntities = plantingSite.plantingZones.flatMap((zone: ZoneAggregation) =>
    zone.plantingSubzones.flatMap((sz: SubzoneAggregation) => getMonitoringPlotMapData(sz.monitoringPlots, true))
  );

  const temporaryPlotEntities = plantingSite.plantingZones.flatMap((zone: ZoneAggregation) =>
    zone.plantingSubzones.flatMap((sz: SubzoneAggregation) => getMonitoringPlotMapData(sz.monitoringPlots, false))
  );

  return {
    site: extractPlantingSite(plantingSite),
    zone: extractPlantingZones(plantingSite),
    subzone: extractSubzones(plantingSite),
    permanentPlot: { id: 'permanentPlots', entities: permanentPlotEntities },
    temporaryPlot: { id: 'temporaryPlots', entities: temporaryPlotEntities },
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
        name: plot.monitoringPlotName,
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
  getMapDataFromObservation,
  getMapDataFromAggregation,
  getPlantingSiteBoundingBox,
  getMapEntityGeometry,
  extractPlantingSite,
  extractPlantingZones,
  extractSubzones,
};

export default MapService;
