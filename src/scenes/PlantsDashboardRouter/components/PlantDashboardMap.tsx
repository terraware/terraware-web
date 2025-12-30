import React, { useCallback, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, useTheme } from '@mui/material';

import MapComponent from 'src/components/NewMap';
import { MapDrawerSize } from 'src/components/NewMap/MapDrawer';
import MapDrawerPagination from 'src/components/NewMap/MapDrawerPagination';
import { MapLegendGroup } from 'src/components/NewMap/MapLegend';
import {
  MapFillComponentStyle,
  MapHighlightGroup,
  MapIconComponentStyle,
  MapLayer,
  MapLayerFeature,
  MapLayerFeatureId,
  MapMarker,
  MapMarkerGroup,
  MapNameTag,
  MapPoint,
} from 'src/components/NewMap/types';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import { getBoundingBoxFromPoints } from 'src/components/NewMap/utils';
import { useLocalization } from 'src/providers';
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

import MapPhotoDrawer from './MapPhotoDrawer';
import MapPlantDrawer from './MapPlantDrawer';
import MapStatsDrawer from './MapStatsDrawer';

type PlotPhoto = {
  observationId: number;
  monitoringPlotId: number;
  photo: ObservationMonitoringPlotPhotoWithGps;
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
  disableObserationEvents?: boolean;
  disableSurvivalRate?: boolean;
  plantingSites: PlantingSite[];
  observationResults: ObservationResultsPayload[];
  latestSummary?: ObservationSummary;
};

const PlantDashboardMap = ({
  disablePhotoMarkers,
  disablePlantMarkers,
  disableObserationEvents,
  disableSurvivalRate,
  plantingSites,
  observationResults,
  latestSummary,
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
  const [selectedLayer, setSelectedLayer] = useState<string | undefined>('zones');

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

  const plotPhotoStyle = useMemo(
    (): MapIconComponentStyle => ({
      iconColor: '#CC79A7',
      iconName: 'iconPhoto',
      type: 'icon',
    }),
    []
  );

  const livePlantStyle = useMemo(
    (): MapIconComponentStyle => ({
      iconColor: '#40B0A6',
      iconName: 'iconLivePlant',
      type: 'icon',
    }),
    []
  );

  const deadPlantStyle = useMemo(
    (): MapIconComponentStyle => ({
      iconColor: '#E1BE6A',
      iconName: 'iconLivePlant',
      type: 'icon',
    }),
    []
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
    (monitoringPlotId: number, observationId: number, photo: ObservationMonitoringPlotPhotoWithGps) => () => {
      setSelectedFeature(undefined);
      setSelectedPhotos([{ monitoringPlotId, observationId, photo }]);
      setSelectedPlants([]);
      setDrawerOpen(true);
      setDrawerSize('medium');
      setDrawerPage(1);
    },
    []
  );

  const selectPhotosFromMarkers = useCallback((selectedMarkers: MapMarker[]) => {
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

  const selectPlantsFromMarkers = useCallback((selectedMarkers: MapMarker[]) => {
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

      return (
        <MapDrawerPagination
          drawerSize={drawerSize}
          page={drawerPage}
          setPage={setDrawerPage}
          totalPages={totalPages}
        />
      );
    }
  }, [drawerPage, drawerSize, selectedPhotos.length, selectedPlants.length]);

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
        visible: selectedLayer === 'sites',
      },
      {
        features: features.flatMap(({ zoneFeatures }) => zoneFeatures),
        label: strings.ZONES,
        layerId: 'zones',
        style: zonesLayerStyle,
        visible: selectedLayer === 'zones',
      },
      {
        features: features.flatMap(({ subzoneFeatures }) => subzoneFeatures),
        label: strings.SUBZONES,
        layerId: 'subzones',
        style: subzonesLayerStyle,
        visible: selectedLayer === 'subzones',
      },
    ];
  }, [
    extractFeaturesFromSite,
    plantingSites,
    selectedLayer,
    sitesLayerStyle,
    strings,
    subzonesLayerStyle,
    zonesLayerStyle,
  ]);

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
      const zoneId = { layerId: 'zones', featureId: `${zone.stratumId}` };
      sortFeatureBySurvivalRate(zoneId, zone.survivalRate);

      zone.substrata.forEach((subzone) => {
        const subzoneId = { layerId: 'subzones', featureId: `${subzone.substratumId}` };
        sortFeatureBySurvivalRate(subzoneId, subzone.survivalRate);
      });
    });

    return {
      lessThanFifty,
      lessThanSeventyFive,
      greaterThanSeventyFive,
    };
  }, [observationResults, latestSummary]);

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

      plantingSite.strata?.forEach((zone) => {
        const zoneId = { layerId: 'zones', featureId: `${zone.id}` };
        sortFeatureByObservationRecency(zoneId, zone.latestObservationCompletedTime);
        zone.substrata.forEach((subzone) => {
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
  const [survivalRateVisible, setSurvivalRateVisible] = useState<boolean>(false);
  const [observationEventsVisible, setObservationEventsVisible] = useState<boolean>(false);

  const markers = useMemo((): MapMarkerGroup[] => {
    return [
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
    ];
  }, [
    deadPlantsVisible,
    livePlantsVisible,
    photoMarkers,
    plantsMarkers,
    plotPhotoVisible,
    selectPhotosFromMarkers,
    selectPlantsFromMarkers,
    strings.DEAD_PLANTS,
    strings.LIVE_PLANTS,
    strings.MONITORING_PLOTS,
  ]);

  const highlights = useMemo((): MapHighlightGroup[] => {
    return [
      {
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
      {
        highlightId: 'survivalRate',
        highlights: [
          {
            featureIds: survivalRateHighlights.lessThanFifty,
            style: {
              fillPatternUrl: '/assets/survival-rate-less-50.png',
              type: 'fill',
            },
          },
          {
            featureIds: survivalRateHighlights.lessThanSeventyFive,
            style: {
              fillPatternUrl: '/assets/survival-rate-more-50.png',
              type: 'fill',
            },
          },
          {
            featureIds: survivalRateHighlights.greaterThanSeventyFive,
            style: {
              fillPatternUrl: '/assets/survival-rate-more-75.png',
              type: 'fill',
            },
          },
        ],
        visible: survivalRateVisible,
      },
    ];
  }, [
    baseObservationEventStyle,
    survivalRateHighlights,
    survivalRateVisible,
    observationEventsHighlights,
    observationEventsVisible,
  ]);

  const legends = useMemo((): MapLegendGroup[] => {
    return [
      {
        items: [
          {
            id: 'sites',
            label: strings.SITE,
            style: sitesLayerStyle,
          },
          {
            id: 'zones',
            label: strings.ZONES,
            style: zonesLayerStyle,
          },
          {
            id: 'subzones',
            label: strings.SUBZONES,
            style: subzonesLayerStyle,
          },
        ],
        title: strings.BOUNDARIES,
        type: 'single-select',
        selectedLayer,
        setSelectedLayer,
      },
      {
        disabled: disablePhotoMarkers,
        items: [
          {
            id: 'plot-photos',
            label: strings.MONITORING_PLOTS,
            setVisible: setPlotPhotoVisible,
            style: plotPhotoStyle,
            visible: plotPhotoVisible,
          },
        ],
        title: strings.PHOTOS,
        type: 'multi-select',
      },
      {
        disabled: disablePlantMarkers,
        items: [
          {
            id: 'live-plants',
            label: strings.LIVE_PLANTS,
            setVisible: setLivePlantsVisible,
            style: livePlantStyle,
            visible: livePlantsVisible,
          },
          {
            id: 'dead-plants',
            label: strings.DEAD_PLANTS,
            setVisible: setDeadPlantsVisible,
            style: deadPlantStyle,
            visible: deadPlantsVisible,
          },
        ],
        title: strings.PLANTS,
        type: 'multi-select',
      },
      {
        disabled: disableObserationEvents || observationResults.length === 0,
        items: [
          {
            label: strings.LATEST_OBSERVATION,
            style: {
              ...baseObservationEventStyle,
              opacity: 1.0,
            },
          },
        ],
        title: strings.OBSERVATION_EVENTS,
        tooltip: strings.OBSERVATION_EVENTS_TOOLTIP,
        type: 'group-toggle',
        setVisible: setObservationEventsVisible,
        visible: observationEventsVisible,
      },
      {
        disabled: disableSurvivalRate || latestSummary === undefined,
        items: [
          {
            label: strings.LESS_THAN_FIFTY_PERCENT,
            style: {
              fillPatternUrl: '/assets/survival-rate-less-50.png',
              opacity: 1.0,
              type: 'fill',
            },
          },
          {
            label: strings.FIFTY_TO_SEVENTY_FIVE_PERCENT,
            style: {
              fillPatternUrl: '/assets/survival-rate-more-50.png',
              opacity: 1.0,
              type: 'fill',
            },
          },
          {
            label: strings.GREATER_THAN_SEVENTY_FIVE_PERCENT,
            style: {
              fillPatternUrl: '/assets/survival-rate-more-75.png',
              opacity: 1.0,
              type: 'fill',
            },
          },
        ],
        title: strings.SURVIVAL_RATE,
        type: 'group-toggle',
        setVisible: setSurvivalRateVisible,
        visible: survivalRateVisible,
      },
    ];
  }, [
    baseObservationEventStyle,
    deadPlantStyle,
    deadPlantsVisible,
    disableSurvivalRate,
    disableObserationEvents,
    disablePhotoMarkers,
    disablePlantMarkers,
    livePlantStyle,
    livePlantsVisible,
    survivalRateVisible,
    observationEventsVisible,
    observationResults.length,
    latestSummary,
    plotPhotoStyle,
    plotPhotoVisible,
    selectedLayer,
    sitesLayerStyle,
    strings,
    subzonesLayerStyle,
    zonesLayerStyle,
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
