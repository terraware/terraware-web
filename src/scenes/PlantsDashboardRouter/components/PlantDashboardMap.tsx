import React, { useCallback, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box } from '@mui/material';

import MapComponent from 'src/components/NewMap';
import { MapDrawerSize } from 'src/components/NewMap/MapDrawer';
import { MapLegendGroup } from 'src/components/NewMap/MapLegend';
import {
  MapHighlightGroup,
  MapLayer,
  MapLayerFeature,
  MapLayerFeatureId,
  MapMarker,
  MapMarkerGroup,
  MapNameTag,
  MapPoint,
} from 'src/components/NewMap/types';
import useMapFeatureStyles from 'src/components/NewMap/useMapFeatureStyles';
import useMapPhotoDrawer, { PlotPhoto } from 'src/components/NewMap/useMapPhotoDrawer';
import useMapPlantDrawer, { PlotPlant } from 'src/components/NewMap/useMapPlantDrawer';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import useObservationEventsMapLegend from 'src/components/NewMap/useObservationEventsMapLegend';
import usePlantMarkersMapLegend from 'src/components/NewMap/usePlantMarkersMapLegend';
import usePlantingSiteMapLegend from 'src/components/NewMap/usePlantingSiteMapLegend';
import usePlotPhotosMapLegend from 'src/components/NewMap/usePlotPhotosMapLegend';
import useSurvivalRateMapLegend from 'src/components/NewMap/useSurvivalRateMapLegend';
import { getBoundingBoxFromPoints } from 'src/components/NewMap/utils';
import { MapService } from 'src/services';
import {
  ObservationMonitoringPlotPhoto,
  ObservationMonitoringPlotPhotoWithGps,
  ObservationResultsPayload,
  ObservationSummary,
  RecordedPlant,
  RecordedPlantStatus,
} from 'src/types/Observations';
import { PlantingSite } from 'src/types/Tracking';
import useMapboxToken from 'src/utils/useMapboxToken';

import MapStatsDrawer from './MapStatsDrawer';

type LayerFeature = {
  plantingSiteId: number;
  layerFeatureId: MapLayerFeatureId;
};

type PlantDashboardMapProps = {
  disableObserationEvents?: boolean;
  disablePhotoMarkers?: boolean;
  disablePlantMarkers?: boolean;
  disableSurvivalRate?: boolean;
  plantingSites: PlantingSite[];
  observationResults: ObservationResultsPayload[];
  latestSummary?: ObservationSummary;
};

const PlantDashboardMap = ({
  disableObserationEvents,
  disablePhotoMarkers,
  disablePlantMarkers,
  disableSurvivalRate,
  plantingSites,
  observationResults,
  latestSummary,
}: PlantDashboardMapProps): JSX.Element => {
  const { mapId, refreshToken, token } = useMapboxToken();
  const mapRef = useRef<MapRef | null>(null);
  const { fitBounds } = useMapUtils(mapRef);

  const [selectedFeature, setSelectedFeature] = useState<LayerFeature>();
  const { plantDrawerContent, plantDrawerHeader, plantDrawerSize, selectedPlants, selectPlants } = useMapPlantDrawer();
  const { photoDrawerContent, photoDrawerHeader, photoDrawerSize, selectedPhotos, selectPhotos } = useMapPhotoDrawer();

  const { selectedLayer, plantingSiteLegendGroup } = usePlantingSiteMapLegend('strata');
  const { deadPlantsVisible, livePlantsVisible, plantMakersLegendGroup } = usePlantMarkersMapLegend(
    disablePlantMarkers || observationResults.length === 0
  );
  const { observationEventsVisible, observationEventsLegendGroup } = useObservationEventsMapLegend(
    disableObserationEvents || observationResults.length === 0
  );
  const { plotPhotosVisible, plotPhotosLegendGroup } = usePlotPhotosMapLegend(
    disablePhotoMarkers || observationResults.length === 0
  );
  const { survivalRateVisible, survivalRateLegendGroup } = useSurvivalRateMapLegend(
    disableSurvivalRate || latestSummary === undefined
  );

  const {
    sitesLayerStyle,
    strataLayerStyle,
    substrataLayerStyle,
    observationEventStyle,
    survivalRate50To75,
    survivalRateLessThan50,
    survivalRateMoreThan75,
  } = useMapFeatureStyles();

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const selectFeature = useCallback(
    (plantingSiteId: number) => (layerId: string, featureId: string) => () => {
      setSelectedFeature({ layerFeatureId: { layerId, featureId }, plantingSiteId });
      selectPhotos([]);
      setDrawerOpen(true);
    },
    [selectPhotos]
  );

  const selectPhoto = useCallback(
    (monitoringPlotId: number, observationId: number, photo: ObservationMonitoringPlotPhotoWithGps) => () => {
      setSelectedFeature(undefined);
      selectPhotos([{ monitoringPlotId, observationId, photo }]);
      selectPlants([]);
      setDrawerOpen(true);
    },
    [selectPhotos, selectPlants]
  );

  const selectPhotosFromMarkers = useCallback(
    (selectedMarkers: MapMarker[]) => {
      const photos = selectedMarkers
        .map((marker): PlotPhoto | undefined => {
          if (marker.properties) {
            const observationId = marker.properties.observationId as number;
            const monitoringPlotId = marker.properties.monitoringPlotId as number;
            const photo = marker.properties.photo as ObservationMonitoringPlotPhotoWithGps;
            return { monitoringPlotId, observationId, photo };
          }
        })
        .filter((photo): photo is PlotPhoto => photo !== undefined);
      setSelectedFeature(undefined);
      selectPhotos(photos);
      selectPlants([]);
      setDrawerOpen(true);
    },
    [selectPhotos, selectPlants]
  );

  const selectPlant = useCallback(
    (monitoringPlotId: number, observationId: number, plant: RecordedPlant) => () => {
      setSelectedFeature(undefined);
      selectPhotos([]);
      selectPlants([{ monitoringPlotId, observationId, plant }]);
      setDrawerOpen(true);
    },
    [selectPhotos, selectPlants]
  );

  const selectPlantsFromMarkers = useCallback(
    (selectedMarkers: MapMarker[]) => {
      const plants = selectedMarkers
        .map((marker): PlotPlant | undefined => {
          if (marker.properties) {
            const observationId = marker.properties.observationId as number;
            const monitoringPlotId = marker.properties.monitoringPlotId as number;
            const plant = marker.properties.plant as RecordedPlant;
            return { monitoringPlotId, observationId, plant };
          }
        })
        .filter((plant): plant is PlotPlant => plant !== undefined);
      setSelectedFeature(undefined);
      selectPhotos([]);
      selectPlants(plants);
      setDrawerOpen(true);
    },
    [selectPhotos, selectPlants]
  );

  const drawerContent = useMemo(() => {
    if (selectedFeature) {
      return (
        <MapStatsDrawer
          layerFeatureId={selectedFeature.layerFeatureId}
          plantingSiteId={selectedFeature.plantingSiteId}
        />
      );
    }
    if (selectedPhotos.length > 0) {
      return photoDrawerContent;
    }
    if (selectedPlants.length > 0) {
      return plantDrawerContent;
    }
  }, [photoDrawerContent, plantDrawerContent, selectedFeature, selectedPhotos.length, selectedPlants.length]);

  const drawerHeader = useMemo(() => {
    if (selectedPhotos.length > 0) {
      return photoDrawerHeader;
    } else if (selectedPlants.length > 0) {
      return plantDrawerHeader;
    } else {
      return undefined;
    }
  }, [photoDrawerHeader, plantDrawerHeader, selectedPhotos.length, selectedPlants.length]);

  const drawerSize: MapDrawerSize = useMemo(() => {
    if (selectedPhotos.length > 0) {
      return photoDrawerSize;
    } else if (selectedPlants.length > 0) {
      return plantDrawerSize;
    } else {
      return 'small';
    }
  }, [photoDrawerSize, plantDrawerSize, selectedPhotos.length, selectedPlants.length]);

  const extractFeaturesFromSite = useCallback(
    (
      site: PlantingSite
    ): {
      siteFeatures: MapLayerFeature[];
      zoneFeatures: MapLayerFeature[];
      subzoneFeatures: MapLayerFeature[];
    } => {
      const zones = site.strata ?? [];
      const subzones = site.strata?.flatMap((zone) => zone.substrata);

      return {
        siteFeatures: [
          {
            featureId: `${site.id}`,
            geometry: {
              type: 'MultiPolygon',
              coordinates: site.boundary?.coordinates ?? [],
            },
            onClick: selectFeature(site.id)('sites', `${site.id}`),
            selected:
              selectedFeature?.layerFeatureId.layerId === 'sites' &&
              selectedFeature?.layerFeatureId.featureId === `${site.id}`,
          },
        ],
        zoneFeatures: zones.map((zone) => ({
          featureId: `${zone.id}`,
          label: zone.name,
          geometry: {
            type: 'MultiPolygon',
            coordinates: zone.boundary.coordinates,
          },
          onClick: selectFeature(site.id)('strata', `${zone.id}`),
          selected:
            selectedFeature?.layerFeatureId.layerId === 'strata' &&
            selectedFeature?.layerFeatureId.featureId === `${zone.id}`,
        })),
        subzoneFeatures:
          subzones?.map((subzone) => ({
            featureId: `${subzone.id}`,
            label: subzone.name,
            geometry: {
              type: 'MultiPolygon',
              coordinates: subzone.boundary.coordinates,
            },
            onClick: selectFeature(site.id)('substrata', `${subzone.id}`),
            selected:
              selectedFeature?.layerFeatureId.layerId === 'substrata' &&
              selectedFeature?.layerFeatureId.featureId === `${subzone.id}`,
          })) ?? [],
      };
    },
    [selectFeature, selectedFeature]
  );

  const layers = useMemo((): MapLayer[] => {
    if (plantingSites.length === 0) {
      return [];
    }

    const features = plantingSites.map((site) => extractFeaturesFromSite(site));

    return [
      {
        features: features.flatMap(({ siteFeatures }) => siteFeatures),
        layerId: 'sites',
        style: sitesLayerStyle,
        visible: selectedLayer === 'sites',
      },
      {
        features: features.flatMap(({ zoneFeatures }) => zoneFeatures),
        layerId: 'strata',
        style: strataLayerStyle,
        visible: selectedLayer === 'strata',
      },
      {
        features: features.flatMap(({ subzoneFeatures }) => subzoneFeatures),
        layerId: 'substrata',
        style: substrataLayerStyle,
        visible: selectedLayer === 'substrata',
      },
    ];
  }, [extractFeaturesFromSite, plantingSites, selectedLayer, sitesLayerStyle, substrataLayerStyle, strataLayerStyle]);

  const photoMarkers = useMemo((): MapMarker[] => {
    if (observationResults.length === 0) {
      return [];
    }

    const hasGpsCoordinates = (photo: ObservationMonitoringPlotPhoto): photo is ObservationMonitoringPlotPhotoWithGps =>
      !!photo.gpsCoordinates;

    return observationResults.flatMap((results) =>
      results.strata
        .flatMap((zone) => zone.substrata)
        .flatMap((subzone) => subzone.monitoringPlots)
        .flatMap((plot): MapMarker[] =>
          plot.photos.filter(hasGpsCoordinates).map((photo) => {
            return {
              id: `photos/${photo.fileId}`,
              longitude: photo.gpsCoordinates?.coordinates[1],
              latitude: photo.gpsCoordinates?.coordinates[0],
              onClick: selectPhoto(plot.monitoringPlotId, results.observationId, photo),
              selected: selectedPhotos.find((selected) => selected.photo.fileId === photo.fileId) !== undefined,
              properties: {
                monitoringPlotId: plot.monitoringPlotId,
                observationId: results.observationId,
                photo,
              },
            };
          })
        )
    );
  }, [observationResults, selectPhoto, selectedPhotos]);

  const plantsMarkers = useCallback(
    (status: RecordedPlantStatus): MapMarker[] => {
      if (observationResults.length === 0) {
        return [];
      }

      return observationResults.flatMap((results) =>
        results.strata
          .flatMap((zone) => zone.substrata)
          .flatMap((subzone) => subzone.monitoringPlots)
          .flatMap((plot): MapMarker[] => {
            if (plot.plants) {
              const filteredPlants = plot.plants.filter((plant) => plant.status === status);
              return filteredPlants.map(
                (plant): MapMarker => ({
                  id: `plants/${plant.id}`,
                  longitude: plant.gpsCoordinates.coordinates[1],
                  latitude: plant.gpsCoordinates.coordinates[0],
                  onClick: selectPlant(plot.monitoringPlotId, results.observationId, plant),
                  selected: selectedPlants.find((selected) => selected.plant.id === plant.id) !== undefined,
                  properties: {
                    monitoringPlotId: plot.monitoringPlotId,
                    observationId: results.observationId,
                    plant,
                  },
                })
              );
            } else {
              return [];
            }
          })
      );
    },
    [observationResults, selectPlant, selectedPlants]
  );

  const survivalRateHighlights = useMemo(() => {
    const lessThanFifty: MapLayerFeatureId[] = [];
    const lessThanSeventyFive: MapLayerFeatureId[] = [];
    const greaterThanSeventyFive: MapLayerFeatureId[] = [];

    if (observationResults.length === 0) {
      return {
        lessThanFifty,
        lessThanSeventyFive,
        greaterThanSeventyFive,
      };
    }

    const sortFeatureBySurvivalRate = (entityId: MapLayerFeatureId, survivalRate: number | undefined) => {
      if (survivalRate !== undefined) {
        if (survivalRate < 50) {
          lessThanFifty.push(entityId);
        } else if (survivalRate < 75) {
          lessThanSeventyFive.push(entityId);
        } else {
          greaterThanSeventyFive.push(entityId);
        }
      }
    };

    const siteId = { layerId: 'sites', featureId: `${latestSummary?.plantingSiteId}` };
    sortFeatureBySurvivalRate(siteId, latestSummary?.survivalRate);

    latestSummary?.strata.forEach((zone) => {
      const zoneId = { layerId: 'strata', featureId: `${zone.stratumId}` };
      sortFeatureBySurvivalRate(zoneId, zone.survivalRate);

      zone.substrata.forEach((subzone) => {
        const subzoneId = { layerId: 'substrata', featureId: `${subzone.substratumId}` };
        sortFeatureBySurvivalRate(subzoneId, subzone.survivalRate);
      });
    });

    return {
      lessThanFifty,
      lessThanSeventyFive,
      greaterThanSeventyFive,
    };
  }, [observationResults, latestSummary]);

  const setDrawerOpenCallback = useCallback(
    (open: boolean) => {
      if (open) {
        setDrawerOpen(true);
      } else {
        setDrawerOpen(false);
        setSelectedFeature(undefined);
        selectPhotos([]);
        selectPlants([]);
      }
    },
    [selectPhotos, selectPlants]
  );

  const observationEventsHighlights = useMemo((): MapLayerFeatureId[][] => {
    const recencyHighlights: MapLayerFeatureId[][] = [[], [], [], [], []];

    if (plantingSites.length === 0) {
      return recencyHighlights;
    }

    const sortFeatureByObservationRecency = (featureId: MapLayerFeatureId, time: string | undefined) => {
      if (time !== undefined) {
        const recency = MapService.getRecencyFromTime(time);
        recencyHighlights[recency - 1].push(featureId);
      }
    };

    plantingSites.forEach((plantingSite) => {
      const siteId = { layerId: 'sites', featureId: `${plantingSite.id}` };
      sortFeatureByObservationRecency(siteId, plantingSite.latestObservationCompletedTime);

      plantingSite.strata?.forEach((zone) => {
        const zoneId = { layerId: 'strata', featureId: `${zone.id}` };
        sortFeatureByObservationRecency(zoneId, zone.latestObservationCompletedTime);
        zone.substrata.forEach((subzone) => {
          const subzoneId = { layerId: 'substrata', featureId: `${subzone.id}` };
          sortFeatureByObservationRecency(subzoneId, subzone.latestObservationCompletedTime);
        });
      });
    });

    return recencyHighlights;
  }, [plantingSites]);

  const markers = useMemo((): MapMarkerGroup[] => {
    return [
      {
        markers: photoMarkers,
        markerGroupId: 'plot-photos',
        onClusterClick: selectPhotosFromMarkers,
        style: {
          iconColor: '#CC79A7',
          iconName: 'iconPhoto',
          type: 'icon',
        },
        visible: plotPhotosVisible,
      },
      {
        markers: plantsMarkers('Live'),
        markerGroupId: 'live-plants',
        onClusterClick: selectPlantsFromMarkers,
        style: {
          iconColor: '#40B0A6',
          iconName: 'iconLivePlant',
          type: 'icon',
        },
        visible: livePlantsVisible,
      },
      {
        markers: plantsMarkers('Dead'),
        markerGroupId: 'dead-plants',
        onClusterClick: selectPlantsFromMarkers,
        style: {
          iconColor: '#E1BE6A',
          iconName: 'iconLivePlant',
          type: 'icon',
        },
        visible: deadPlantsVisible,
      },
    ];
  }, [
    deadPlantsVisible,
    livePlantsVisible,
    photoMarkers,
    plantsMarkers,
    plotPhotosVisible,
    selectPhotosFromMarkers,
    selectPlantsFromMarkers,
  ]);

  const highlights = useMemo((): MapHighlightGroup[] => {
    return [
      {
        highlightId: 'observationEvents',
        highlights: [
          {
            featureIds: observationEventsHighlights[0],
            style: {
              ...observationEventStyle,
              opacity: 0.9,
            },
          },
          {
            featureIds: observationEventsHighlights[1],
            style: {
              ...observationEventStyle,
              opacity: 0.7,
            },
          },
          {
            featureIds: observationEventsHighlights[2],
            style: {
              ...observationEventStyle,
              opacity: 0.5,
            },
          },
          {
            featureIds: observationEventsHighlights[3],
            style: {
              ...observationEventStyle,
              opacity: 0.3,
            },
          },
          {
            featureIds: observationEventsHighlights[4],
            style: {
              ...observationEventStyle,
              opacity: 0.1,
            },
          },
        ],
        visible: observationEventsVisible,
      },
      {
        highlightId: 'survivalRate',
        highlights: [
          {
            featureIds: survivalRateHighlights.lessThanFifty,
            style: survivalRateLessThan50,
          },
          {
            featureIds: survivalRateHighlights.lessThanSeventyFive,
            style: survivalRate50To75,
          },
          {
            featureIds: survivalRateHighlights.greaterThanSeventyFive,
            style: survivalRateMoreThan75,
          },
        ],
        visible: survivalRateVisible,
      },
    ];
  }, [
    observationEventStyle,
    observationEventsHighlights,
    observationEventsVisible,
    survivalRate50To75,
    survivalRateHighlights.greaterThanSeventyFive,
    survivalRateHighlights.lessThanFifty,
    survivalRateHighlights.lessThanSeventyFive,
    survivalRateLessThan50,
    survivalRateMoreThan75,
    survivalRateVisible,
  ]);

  const legends = useMemo((): MapLegendGroup[] => {
    return [
      plantingSiteLegendGroup,
      plotPhotosLegendGroup,
      plantMakersLegendGroup,
      observationEventsLegendGroup,
      survivalRateLegendGroup,
    ];
  }, [
    plantingSiteLegendGroup,
    plotPhotosLegendGroup,
    plantMakersLegendGroup,
    observationEventsLegendGroup,
    survivalRateLegendGroup,
  ]);

  const nameTags = useMemo((): MapNameTag[] | undefined => {
    return plantingSites
      .map((site): MapNameTag | undefined => {
        if (site.boundary) {
          const points = site.boundary.coordinates
            .flat()
            .flat()
            .map(
              ([lng, lat]): MapPoint => ({
                lat,
                lng,
              })
            );

          const bbox = getBoundingBoxFromPoints(points);
          const latitude = (bbox.maxLat + bbox.minLat) / 2;
          const longitude = (bbox.maxLng + bbox.minLng) / 2;

          return {
            label: site.name,
            longitude,
            latitude,
            onClick: () => fitBounds(bbox),
          };
        }
      })
      .filter((nameTag): nameTag is MapNameTag => nameTag !== undefined);
  }, [fitBounds, plantingSites]);

  return token ? (
    <MapComponent
      clusterMaxZoom={20}
      drawerChildren={drawerContent}
      drawerHeader={drawerHeader}
      drawerOpen={drawerOpen}
      drawerSize={drawerSize}
      legends={legends}
      mapHighlights={highlights}
      mapId={mapId}
      mapLayers={layers}
      mapMarkers={markers}
      mapRef={mapRef}
      nameTags={nameTags}
      onTokenExpired={refreshToken}
      token={token}
      setDrawerOpen={setDrawerOpenCallback}
    />
  ) : (
    <Box />
  );
};

export default PlantDashboardMap;
