import React, { useCallback, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, useTheme } from '@mui/material';

import MapComponent, { MapFeatureSection } from 'src/components/NewMap';
import { MapDrawerSize } from 'src/components/NewMap/MapDrawer';
import {
  MapFillComponentStyle,
  MapLayer,
  MapLayerFeature,
  MapLayerFeatureId,
  MapMarker,
  MapNameTag,
  MapPoint,
} from 'src/components/NewMap/types';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import { getBoundingBoxFromPoints } from 'src/components/NewMap/utils';
import isEnabled from 'src/features';
import { useLocalization } from 'src/providers';
import { MapService } from 'src/services';
import {
  ObservationMonitoringPlotPhoto,
  ObservationResultsPayload,
  RecordedPlant,
  RecordedPlantStatus,
} from 'src/types/Observations';
import { PlantingSite } from 'src/types/Tracking';
import useMapboxToken from 'src/utils/useMapboxToken';

import MapDrawerPagination from './MapDrawerPagination';
import MapPhotoDrawer from './MapPhotoDrawer';
import MapPlantDrawer from './MapPlantDrawer';
import MapStatsDrawer from './MapStatsDrawer';

type PlotPhoto = {
  observationId: number;
  monitoringPlotId: number;
  photo: ObservationMonitoringPlotPhoto;
};

type PlotPlant = {
  observationId: number;
  monitoringPlotId: number;
  plant: RecordedPlant;
};

type LayerFeature = {
  plantingSiteId: number;
  layerFeatureId: MapLayerFeatureId;
};

type PlantDashboardMapProps = {
  disablePhotoMarkers?: boolean;
  disablePlantMarkers?: boolean;
  disableMortalityRate?: boolean;
  disableObserationEvents?: boolean;
  plantingSites: PlantingSite[];
  observationResults: ObservationResultsPayload[];
};

const PlantDashboardMap = ({
  disablePhotoMarkers,
  disablePlantMarkers,
  disableMortalityRate,
  disableObserationEvents,
  plantingSites,
  observationResults,
}: PlantDashboardMapProps): JSX.Element => {
  const { mapId, refreshToken, token } = useMapboxToken();
  const mapRef = useRef<MapRef | null>(null);
  const { fitBounds } = useMapUtils(mapRef);
  const { strings } = useLocalization();
  const theme = useTheme();

  const [drawerPage, setDrawerPage] = useState<number>(1);
  const [selectedFeature, setSelectedFeature] = useState<LayerFeature>();
  const [selectedPhotos, setSelectedPhotos] = useState<PlotPhoto[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<PlotPlant[]>([]);
  const isSurvivalRateCalculationEnabled = isEnabled('Survival Rate Calculation');

  const sitesLayerStyle = useMemo(
    (): MapFillComponentStyle => ({
      borderColor: theme.palette.TwClrBaseGreen300,
      fillColor: theme.palette.TwClrBaseGreen300,
      opacity: 0.2,
      type: 'fill',
    }),
    [theme]
  );

  const zonesLayerStyle = useMemo(
    (): MapFillComponentStyle => ({
      borderColor: theme.palette.TwClrBasePurple300,
      fillColor: theme.palette.TwClrBasePurple300,
      opacity: 0.2,
      type: 'fill',
    }),
    [theme]
  );

  const subzonesLayerStyle = useMemo(
    (): MapFillComponentStyle => ({
      borderColor: theme.palette.TwClrBaseBlue300,
      fillColor: theme.palette.TwClrBaseBlue300,
      opacity: 0.2,
      type: 'fill',
    }),
    [theme]
  );

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerSize, setDrawerSize] = useState<MapDrawerSize>('small');

  const selectFeature = useCallback(
    (plantingSiteId: number) => (layerId: string, featureId: string) => () => {
      setSelectedFeature({ layerFeatureId: { layerId, featureId }, plantingSiteId });
      setSelectedPhotos([]);
      setDrawerOpen(true);
      setDrawerSize('small');
      setDrawerPage(1);
    },
    []
  );

  const selectPhoto = useCallback(
    (monitoringPlotId: number, observationId: number, photo: ObservationMonitoringPlotPhoto) => () => {
      setSelectedFeature(undefined);
      setSelectedPhotos([{ monitoringPlotId, observationId, photo }]);
      setSelectedPlants([]);
      setDrawerOpen(true);
      setDrawerSize('medium');
      setDrawerPage(1);
    },
    []
  );

  const selectPhotosFromMarkers = useCallback((markers: MapMarker[]) => {
    const photos = markers
      .map((marker): PlotPhoto | undefined => {
        if (marker.properties) {
          const observationId = marker.properties.observationId as number;
          const monitoringPlotId = marker.properties.monitoringPlotId as number;
          const photo = marker.properties.photo as ObservationMonitoringPlotPhoto;
          return { monitoringPlotId, observationId, photo };
        }
      })
      .filter((photo): photo is PlotPhoto => photo !== undefined);
    setSelectedFeature(undefined);
    setSelectedPhotos(photos);
    setSelectedPlants([]);
    setDrawerOpen(true);
    setDrawerSize('medium');
    setDrawerPage(1);
  }, []);

  const selectPlant = useCallback(
    (monitoringPlotId: number, observationId: number, plant: RecordedPlant) => () => {
      setSelectedFeature(undefined);
      setSelectedPhotos([]);
      setSelectedPlants([{ monitoringPlotId, observationId, plant }]);
      setDrawerOpen(true);
      setDrawerSize('small');
      setDrawerPage(1);
    },
    []
  );

  const selectPlantsFromMarkers = useCallback((markers: MapMarker[]) => {
    const plants = markers
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
    setSelectedPhotos([]);
    setSelectedPlants(plants);
    setDrawerOpen(true);
    setDrawerSize('small');
    setDrawerPage(1);
  }, []);

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
      const selectedPhoto = selectedPhotos[drawerPage - 1];
      return (
        <MapPhotoDrawer
          monitoringPlotId={selectedPhoto.monitoringPlotId}
          observationId={selectedPhoto.observationId}
          photo={selectedPhoto.photo}
        />
      );
    }
    if (selectedPlants.length > 0) {
      const selectedPlant = selectedPlants[drawerPage - 1];
      return (
        <MapPlantDrawer
          monitoringPlotId={selectedPlant.monitoringPlotId}
          observationId={selectedPlant.observationId}
          plant={selectedPlant.plant}
        />
      );
    }
  }, [drawerPage, selectedFeature, selectedPhotos, selectedPlants]);

  const drawerHeader = useMemo(() => {
    if (selectedPhotos.length > 1 || selectedPlants.length > 1) {
      const totalPages = Math.max(selectedPhotos.length, selectedPlants.length);

      return <MapDrawerPagination page={drawerPage} setPage={setDrawerPage} totalPages={totalPages} />;
    }
  }, [drawerPage, selectedPhotos.length, selectedPlants.length]);

  const extractFeaturesFromSite = useCallback(
    (
      site: PlantingSite
    ): {
      siteFeatures: MapLayerFeature[];
      zoneFeatures: MapLayerFeature[];
      subzoneFeatures: MapLayerFeature[];
    } => {
      const zones = site.plantingZones ?? [];
      const subzones = site.plantingZones?.flatMap((zone) => zone.plantingSubzones);

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
          onClick: selectFeature(site.id)('zones', `${zone.id}`),
          selected:
            selectedFeature?.layerFeatureId.layerId === 'zones' &&
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
            onClick: selectFeature(site.id)('subzones', `${subzone.id}`),
            selected:
              selectedFeature?.layerFeatureId.layerId === 'subzones' &&
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
        label: strings.SITE,
        layerId: 'sites',
        style: sitesLayerStyle,
      },
      {
        features: features.flatMap(({ zoneFeatures }) => zoneFeatures),
        label: strings.ZONES,
        layerId: 'zones',
        style: zonesLayerStyle,
      },
      {
        features: features.flatMap(({ subzoneFeatures }) => subzoneFeatures),
        label: strings.SUBZONES,
        layerId: 'subzones',
        style: subzonesLayerStyle,
      },
    ];
  }, [extractFeaturesFromSite, plantingSites, sitesLayerStyle, strings, subzonesLayerStyle, zonesLayerStyle]);

  const photoMarkers = useMemo((): MapMarker[] => {
    if (observationResults.length === 0) {
      return [];
    }

    return observationResults.flatMap((results) =>
      results.plantingZones
        .flatMap((zone) => zone.plantingSubzones)
        .flatMap((subzone) => subzone.monitoringPlots)
        .flatMap((plot): MapMarker[] =>
          plot.photos.map((photo) => {
            return {
              id: `photos/${photo.fileId}`,
              longitude: photo.gpsCoordinates.coordinates[1],
              latitude: photo.gpsCoordinates.coordinates[0],
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
        results.plantingZones
          .flatMap((zone) => zone.plantingSubzones)
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

  const mortalityRateHighlights = useMemo(() => {
    const lessThanTwentyFive: MapLayerFeatureId[] = [];
    const lessThanFifty: MapLayerFeatureId[] = [];
    const greaterThanFifty: MapLayerFeatureId[] = [];

    if (observationResults.length === 0) {
      return {
        lessThanTwentyFive,
        lessThanFifty,
        greaterThanFifty,
      };
    }

    const sortFeatureByMortalityRate = (entityId: MapLayerFeatureId, mortalityRate: number | undefined) => {
      if (mortalityRate !== undefined) {
        if (mortalityRate < 25) {
          lessThanTwentyFive.push(entityId);
        } else if (mortalityRate < 50) {
          lessThanFifty.push(entityId);
        } else {
          greaterThanFifty.push(entityId);
        }
      }
    };

    observationResults.forEach((results) => {
      const siteId = { layerId: 'sites', featureId: `${results.plantingSiteId}` };
      if (isSurvivalRateCalculationEnabled) {
        sortFeatureByMortalityRate(siteId, results.survivalRate);
      } else {
        sortFeatureByMortalityRate(siteId, results.mortalityRate);
      }

      results.plantingZones.forEach((zone) => {
        const zoneId = { layerId: 'zones', featureId: `${zone.plantingZoneId}` };
        if (isSurvivalRateCalculationEnabled) {
          sortFeatureByMortalityRate(zoneId, zone.survivalRate);
        } else {
          sortFeatureByMortalityRate(zoneId, zone.mortalityRate);
        }

        zone.plantingSubzones.forEach((subzone) => {
          const subzoneId = { layerId: 'subzones', featureId: `${subzone.plantingSubzoneId}` };
          if (isSurvivalRateCalculationEnabled) {
            sortFeatureByMortalityRate(subzoneId, subzone.survivalRate);
          } else {
            sortFeatureByMortalityRate(subzoneId, subzone.mortalityRate);
          }
        });
      });
    });

    return {
      lessThanTwentyFive,
      lessThanFifty,
      greaterThanFifty,
    };
  }, [isSurvivalRateCalculationEnabled, observationResults]);

  const setDrawerOpenCallback = useCallback((open: boolean) => {
    if (open) {
      setDrawerOpen(true);
    } else {
      setDrawerOpen(false);
      setSelectedFeature(undefined);
      setSelectedPhotos([]);
      setSelectedPlants([]);
    }
  }, []);

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

      plantingSite.plantingZones?.forEach((zone) => {
        const zoneId = { layerId: 'zones', featureId: `${zone.id}` };
        sortFeatureByObservationRecency(zoneId, zone.latestObservationCompletedTime);
        zone.plantingSubzones.forEach((subzone) => {
          const subzoneId = { layerId: 'subzones', featureId: `${subzone.id}` };
          sortFeatureByObservationRecency(subzoneId, subzone.latestObservationCompletedTime);
        });
      });
    });

    return recencyHighlights;
  }, [plantingSites]);

  const baseObservationEventStyle = useMemo(
    (): MapFillComponentStyle => ({
      fillColor: theme.palette.TwClrBasePink200,
      type: 'fill',
    }),
    [theme]
  );

  const [plotPhotoVisible, setPlotPhotoVisible] = useState<boolean>(false);
  const [livePlantsVisible, setLivePlantsVisible] = useState<boolean>(false);
  const [deadPlantsVisible, setDeadPlantsVisible] = useState<boolean>(false);
  const [mortalityRateVisible, setMortalityRateVisible] = useState<boolean>(false);
  const [observationEventsVisible, setObservationEventsVisible] = useState<boolean>(false);

  const mapFeatures = useMemo((): MapFeatureSection[] => {
    return [
      {
        layers,
        type: 'layer',
        sectionTitle: strings.BOUNDARIES,
      },
      {
        groups: [
          {
            label: strings.MONITORING_PLOTS,
            markers: photoMarkers,
            markerGroupId: 'plot-photos',
            onClusterClick: selectPhotosFromMarkers,
            style: {
              iconColor: '#CC79A7',
              iconName: 'iconPhoto',
              type: 'icon',
            },
            visible: plotPhotoVisible,
          },
        ],
        sectionDisabled: disablePhotoMarkers,
        sectionTitle: strings.PHOTOS,
        type: 'marker',
      },
      {
        groups: [
          {
            label: strings.LIVE_PLANTS,
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
            label: strings.DEAD_PLANTS,
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
        ],
        sectionDisabled: disablePlantMarkers,
        sectionTitle: strings.PLANTS,
        type: 'marker',
      },
      {
        highlight: {
          highlightId: 'observationEvents',
          highlights: [
            {
              featureIds: observationEventsHighlights[0],
              style: {
                ...baseObservationEventStyle,
                opacity: 0.9,
              },
            },
            {
              featureIds: observationEventsHighlights[1],
              style: {
                ...baseObservationEventStyle,
                opacity: 0.7,
              },
            },
            {
              featureIds: observationEventsHighlights[2],
              style: {
                ...baseObservationEventStyle,
                opacity: 0.5,
              },
            },
            {
              featureIds: observationEventsHighlights[3],
              style: {
                ...baseObservationEventStyle,
                opacity: 0.3,
              },
            },
            {
              featureIds: observationEventsHighlights[4],
              style: {
                ...baseObservationEventStyle,
                opacity: 0.1,
              },
            },
          ],
          visible: observationEventsVisible,
        },
        sectionDisabled: disableObserationEvents || observationResults.length === 0,
        sectionTitle: strings.OBSERVATION_EVENTS,
        sectionTooltip: strings.OBSERVATION_EVENTS_TOOLTIP,
        legendItems: [
          {
            label: strings.LATEST_OBSERVATION,
            style: {
              ...baseObservationEventStyle,
              opacity: 1.0,
            },
          },
        ],
        type: 'highlight',
      },
      {
        highlight: {
          highlightId: 'mortalityRate',
          highlights: [
            {
              featureIds: mortalityRateHighlights.lessThanTwentyFive,
              style: {
                fillPatternUrl: '/assets/mortality-rate-less-25.png',
                type: 'fill',
              },
            },
            {
              featureIds: mortalityRateHighlights.lessThanFifty,
              style: {
                fillPatternUrl: '/assets/mortality-rate-less-50.png',
                type: 'fill',
              },
            },
            {
              featureIds: mortalityRateHighlights.greaterThanFifty,
              style: {
                fillPatternUrl: '/assets/mortality-rate-more-50.png',
                type: 'fill',
              },
            },
          ],
          visible: mortalityRateVisible,
        },
        sectionDisabled: disableMortalityRate || observationResults.length === 0,
        sectionTitle: isSurvivalRateCalculationEnabled ? strings.SURVIVAL_RATE : strings.MORTALITY_RATE,
        legendItems: [
          {
            label: strings.LESS_THAN_TWENTY_FIVE_PERCENT,
            style: {
              fillPatternUrl: isSurvivalRateCalculationEnabled
                ? '/assets/mortality-rate-more-50.png'
                : '/assets/mortality-rate-less-25.png',
              opacity: 1.0,
              type: 'fill',
            },
          },
          {
            label: strings.TWENTY_FIVE_TO_FIFTY_PERCENT,
            style: {
              fillPatternUrl: '/assets/mortality-rate-less-50.png',
              opacity: 1.0,
              type: 'fill',
            },
          },
          {
            label: strings.GREATER_THAN_FIFTY_PERCENT,
            style: {
              fillPatternUrl: isSurvivalRateCalculationEnabled
                ? '/assets/mortality-rate-less-25.png'
                : '/assets/mortality-rate-more-50.png',
              opacity: 1.0,
              type: 'fill',
            },
          },
        ],
        type: 'highlight',
      },
    ];
  }, [
    baseObservationEventStyle,
    deadPlantsVisible,
    disableMortalityRate,
    disableObserationEvents,
    disablePhotoMarkers,
    disablePlantMarkers,
    isSurvivalRateCalculationEnabled,
    layers,
    livePlantsVisible,
    mortalityRateHighlights,
    mortalityRateVisible,
    observationEventsHighlights,
    observationEventsVisible,
    observationResults,
    photoMarkers,
    plantsMarkers,
    plotPhotoVisible,
    selectPhotosFromMarkers,
    selectPlantsFromMarkers,
    strings,
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

  const setHighlightVisible = useCallback(
    (highlightId: string) => (visible: boolean) => {
      if (highlightId === 'mortalityRate') {
        setMortalityRateVisible(visible);
      } else if (highlightId === 'observationEvents') {
        setObservationEventsVisible(visible);
      }
    },
    []
  );

  const setMarkerVisible = useCallback(
    (markerGroupId: string) => (visible: boolean) => {
      if (markerGroupId === 'plot-photos') {
        setPlotPhotoVisible(visible);
      } else if (markerGroupId === 'live-plants') {
        setLivePlantsVisible(visible);
      } else if (markerGroupId === 'dead-plants') {
        setDeadPlantsVisible(visible);
      }
    },
    []
  );

  return token ? (
    <MapComponent
      clusterMaxZoom={20}
      drawerChildren={drawerContent}
      drawerHeader={drawerHeader}
      drawerOpen={drawerOpen}
      drawerSize={drawerSize}
      features={mapFeatures}
      initialSelectedLayerId={'zones'}
      mapId={mapId}
      mapRef={mapRef}
      nameTags={nameTags}
      onTokenExpired={refreshToken}
      token={token}
      setDrawerOpen={setDrawerOpenCallback}
      setHighlightVisible={setHighlightVisible}
      setMarkerVisible={setMarkerVisible}
    />
  ) : (
    <Box />
  );
};

export default PlantDashboardMap;
