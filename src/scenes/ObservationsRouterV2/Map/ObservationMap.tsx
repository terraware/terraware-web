import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import MapComponent from 'src/components/NewMap';
import { MapDrawerSize } from 'src/components/NewMap/MapDrawer';
import { MapLegendGroup } from 'src/components/NewMap/MapLegend';
import {
  MapHighlightGroup,
  MapLayer,
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
import useMonitoringPlotsMapLegend from 'src/components/NewMap/useMonitoringPlotsMapLegend';
import usePlantMarkersMapLegend from 'src/components/NewMap/usePlantMarkersMapLegend';
import usePlantingSiteMapLegend from 'src/components/NewMap/usePlantingSiteMapLegend';
import usePlotPhotosMapLegend from 'src/components/NewMap/usePlotPhotosMapLegend';
import useSurvivalRateMapLegend from 'src/components/NewMap/useSurvivalRateMapLegend';
import { getBoundingBoxFromPoints } from 'src/components/NewMap/utils';
import { useOrganization } from 'src/providers';
import {
  ObservationMonitoringPlotResultsPayload,
  useLazyListAdHocObservationResultsQuery,
  useLazyListObservationResultsQuery,
} from 'src/queries/generated/observations';
import {
  useLazyGetPlantingSiteHistoryQuery,
  useLazyGetPlantingSiteQuery,
  useLazyListPlantingSitesQuery,
} from 'src/queries/generated/plantingSites';
import {
  ObservationMonitoringPlotPhoto,
  ObservationMonitoringPlotPhotoWithGps,
  RecordedPlant,
  RecordedPlantStatus,
} from 'src/types/Observations';
import useMapboxToken from 'src/utils/useMapboxToken';

import ObservationStatsDrawer from '../ListView/ObservationStatsDrawer';

type LayerFeature = {
  plantingSiteId: number;
  layerFeatureId: MapLayerFeatureId;
};

type ObservationMapProps = {
  isBiomass?: boolean;
  plantingSiteId?: number;
  selectPlantingSiteId: (siteId: number) => void;
};

const ObservationMap = ({ isBiomass, plantingSiteId, selectPlantingSiteId }: ObservationMapProps) => {
  const { mapId, token } = useMapboxToken();
  const { selectedOrganization } = useOrganization();
  const mapRef = useRef<MapRef | null>(null);
  const { fitBounds } = useMapUtils(mapRef);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const { selectedLayer, plantingSiteLegendGroup } = usePlantingSiteMapLegend('sites', plantingSiteId === undefined);
  const { livePlantsVisible, deadPlantsVisible, plantMakersLegendGroup } = usePlantMarkersMapLegend(
    plantingSiteId === undefined
  );
  const { plotPhotosVisible, plotPhotosLegendGroup } = usePlotPhotosMapLegend(plantingSiteId === undefined);
  const { survivalRateVisible, survivalRateLegendGroup } = useSurvivalRateMapLegend(plantingSiteId === undefined);
  const { adHocPlotsVisible, permanentPlotsVisible, temporaryPlotsVisible, monitoringPlotsLegendGroup } =
    useMonitoringPlotsMapLegend(plantingSiteId === undefined, isBiomass, isBiomass);

  const {
    sitesLayerStyle,
    strataLayerStyle,
    substrataLayerStyle,
    adHocPlotsLayerStyle,
    permanentPlotsLayerStyle,
    temporaryPlotsLayerStyle,
    survivalRate50To75,
    survivalRateLessThan50,
    survivalRateMoreThan75,
    plotPhotoStyle,
    livePlantStyle,
    deadPlantStyle,
  } = useMapFeatureStyles();

  const [selectedFeature, setSelectedFeature] = useState<LayerFeature>();
  const { plantDrawerContent, plantDrawerHeader, plantDrawerSize, selectedPlants, selectPlants } = useMapPlantDrawer();
  const { photoDrawerContent, photoDrawerHeader, photoDrawerSize, selectedPhotos, selectPhotos } = useMapPhotoDrawer();

  const [listPlantingSites, listPlantingSitesResult] = useLazyListPlantingSitesQuery();
  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();
  const [getPlantingSiteHistory, getPlantingSiteHistoryResult] = useLazyGetPlantingSiteHistoryQuery();
  const [listObservationResults, listObservationsResultsResponse] = useLazyListObservationResultsQuery();
  const [listAdHocObservationResults, listAdHocObservationResultsResponse] = useLazyListAdHocObservationResultsQuery();

  useEffect(() => {
    if (selectedOrganization && plantingSiteId === undefined) {
      void listPlantingSites(
        {
          organizationId: selectedOrganization.id,
          full: false,
        },
        true
      );
    } else if (selectedOrganization && plantingSiteId !== undefined) {
      void getPlantingSite(plantingSiteId, true);
      void listAdHocObservationResults(
        {
          organizationId: selectedOrganization.id,
          plantingSiteId,
          includePlants: true,
        },
        true
      );
      if (!isBiomass) {
        void listObservationResults(
          {
            organizationId: selectedOrganization.id,
            plantingSiteId,
            includePlants: true,
          },
          true
        );
      }
    }
  }, [
    getPlantingSite,
    isBiomass,
    listAdHocObservationResults,
    listObservationResults,
    listPlantingSites,
    plantingSiteId,
    selectedOrganization,
  ]);

  const allPlantingSites = useMemo(
    () => listPlantingSitesResult.data?.sites ?? [],
    [listPlantingSitesResult.data?.sites]
  );

  const plantingSite = useMemo(() => getPlantingSiteResult.data?.site, [getPlantingSiteResult.data?.site]);

  const observationResults = useMemo(() => {
    if (listObservationsResultsResponse.isSuccess) {
      return listObservationsResultsResponse.data.observations.filter(
        (observation) => observation.type === (isBiomass ? 'Biomass Measurements' : 'Monitoring')
      );
    } else {
      return [];
    }
  }, [isBiomass, listObservationsResultsResponse]);

  const adHocObservationResults = useMemo(() => {
    if (listAdHocObservationResultsResponse.isSuccess) {
      return listAdHocObservationResultsResponse.data.observations.filter(
        (observation) => observation.type === (isBiomass ? 'Biomass Measurements' : 'Monitoring')
      );
    } else {
      return [];
    }
  }, [isBiomass, listAdHocObservationResultsResponse]);

  // TODO: Filter by timeline
  const selectedResults = useMemo(() => {
    if (observationResults.length) {
      return observationResults[0];
    } else if (adHocObservationResults.length) {
      return adHocObservationResults[0];
    } else {
      return undefined;
    }
  }, [adHocObservationResults, observationResults]);

  const monitoringPlots = useMemo(() => {
    if (selectedResults) {
      return selectedResults.strata
        .flatMap((stratum) => stratum.substrata)
        .flatMap((substratum) => substratum.monitoringPlots);
    } else {
      return [];
    }
  }, [selectedResults]);

  const adHocPlots = useMemo(() => {
    return adHocObservationResults
      .filter((observation) => observation.isAdHoc)
      .map((observation) => observation.adHocPlot)
      .filter((plot): plot is ObservationMonitoringPlotResultsPayload => plot !== undefined);
  }, [adHocObservationResults]);

  useEffect(() => {
    if (selectedResults && selectedResults.plantingSiteHistoryId) {
      void getPlantingSiteHistory(
        {
          id: selectedResults.plantingSiteId,
          historyId: selectedResults.plantingSiteHistoryId,
        },
        true
      );
    }
  }, [getPlantingSiteHistory, selectedResults]);

  const selectedHistory = useMemo(
    () => getPlantingSiteHistoryResult.data?.site,
    [getPlantingSiteHistoryResult.data?.site]
  );

  const selectFeature = useCallback(
    (_plantingSiteId: number) => (layerId: string, featureId: string) => () => {
      setSelectedFeature({ layerFeatureId: { layerId, featureId }, plantingSiteId: _plantingSiteId });
      selectPhotos([]);
      setDrawerOpen(true);
    },
    [selectPhotos]
  );

  const layers = useMemo((): MapLayer[] => {
    if (plantingSiteId === undefined) {
      // Show only sites if no layers selected.
      return [
        {
          features: allPlantingSites.map((site) => ({
            featureId: `${site.id}`,
            geometry: {
              type: 'MultiPolygon',
              coordinates: site.boundary?.coordinates ?? [],
            },
          })),
          layerId: 'sites',
          style: sitesLayerStyle,
          visible: true,
        },
      ];
    } else if (selectedHistory) {
      return [
        {
          features: adHocPlots.map((plot) => ({
            featureId: `${plot.monitoringPlotId}`,
            geometry: {
              type: 'MultiPolygon',
              coordinates: [plot.boundary?.coordinates ?? []],
            },
            label: `${plot.monitoringPlotNumber}`,
            onClick: selectFeature(selectedHistory.plantingSiteId)('adHocPlots', `${plot.monitoringPlotId}`),
            selected:
              selectedFeature?.layerFeatureId.layerId === 'adHocPlots' &&
              selectedFeature?.layerFeatureId.featureId === `${plot.monitoringPlotId}`,
          })),
          layerId: 'adHocPlots',
          style: adHocPlotsLayerStyle,
          visible: adHocPlotsVisible,
        },
        {
          features: monitoringPlots
            .filter((plot) => !plot.isPermanent)
            .map((plot) => ({
              featureId: `${plot.monitoringPlotId}`,
              geometry: {
                type: 'MultiPolygon',
                coordinates: [plot.boundary?.coordinates ?? []],
              },
              label: `${plot.monitoringPlotNumber}`,
              onClick: selectFeature(selectedHistory.plantingSiteId)('temporaryPlots', `${plot.monitoringPlotId}`),
              selected:
                selectedFeature?.layerFeatureId.layerId === 'temporaryPlots' &&
                selectedFeature?.layerFeatureId.featureId === `${plot.monitoringPlotId}`,
            })),
          layerId: 'temporaryPlots',
          style: temporaryPlotsLayerStyle,
          visible: temporaryPlotsVisible,
        },
        {
          features: monitoringPlots
            .filter((plot) => plot.isPermanent)
            .map((plot) => ({
              featureId: `${plot.monitoringPlotId}`,
              geometry: {
                type: 'MultiPolygon',
                coordinates: [plot.boundary?.coordinates ?? []],
              },
              label: `${plot.monitoringPlotNumber}`,
              onClick: selectFeature(selectedHistory.plantingSiteId)('permanentPlots', `${plot.monitoringPlotId}`),
              selected:
                selectedFeature?.layerFeatureId.layerId === 'permanentPlots' &&
                selectedFeature?.layerFeatureId.featureId === `${plot.monitoringPlotId}`,
            })),
          layerId: 'permanentPlots',
          style: permanentPlotsLayerStyle,
          visible: permanentPlotsVisible,
        },
        {
          features:
            selectedHistory.strata?.flatMap((stratum) =>
              stratum.substrata.map((substratum) => ({
                featureId: `${substratum.substratumId}`,
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: substratum.boundary?.coordinates ?? [],
                },
                label: substratum.name,
                onClick: selectFeature(selectedHistory.plantingSiteId)('substrata', `${substratum.substratumId}`),
                selected:
                  selectedFeature?.layerFeatureId.layerId === 'substrata' &&
                  selectedFeature?.layerFeatureId.featureId === `${substratum.substratumId}`,
              }))
            ) ?? [],
          layerId: 'substrata',
          style: substrataLayerStyle,
          visible: selectedLayer === 'substrata',
        },
        {
          features:
            selectedHistory.strata?.map((stratum) => ({
              featureId: `${stratum.stratumId}`,
              geometry: {
                type: 'MultiPolygon',
                coordinates: stratum.boundary?.coordinates ?? [],
              },
              label: stratum.name,
              onClick: selectFeature(selectedHistory.plantingSiteId)('strata', `${stratum.stratumId}`),
              selected:
                selectedFeature?.layerFeatureId.layerId === 'strata' &&
                selectedFeature?.layerFeatureId.featureId === `${stratum.stratumId}`,
            })) ?? [],
          layerId: 'strata',
          style: strataLayerStyle,
          visible: selectedLayer === 'strata',
        },
        {
          features: [
            {
              featureId: `${selectedHistory.plantingSiteId}`,
              geometry: {
                type: 'MultiPolygon',
                coordinates: selectedHistory.boundary?.coordinates ?? [],
              },
              onClick: selectFeature(selectedHistory.plantingSiteId)('sites', `${selectedHistory.plantingSiteId}`),
              selected:
                selectedFeature?.layerFeatureId.layerId === 'sites' &&
                selectedFeature?.layerFeatureId.featureId === `${selectedHistory.plantingSiteId}`,
            },
          ],
          layerId: 'sites',
          style: sitesLayerStyle,
          visible: selectedLayer === 'sites',
        },
      ];
    } else if (plantingSiteId !== undefined && plantingSite !== undefined) {
      return [
        {
          features: [
            {
              featureId: `${plantingSite.id}`,
              geometry: {
                type: 'MultiPolygon',
                coordinates: plantingSite.boundary?.coordinates ?? [],
              },
            },
          ],
          layerId: 'sites',
          style: sitesLayerStyle,
          visible: selectedLayer === 'sites',
        },
        {
          features:
            plantingSite.strata?.map((stratum) => ({
              featureId: `${stratum.id}`,
              geometry: {
                type: 'MultiPolygon',
                coordinates: stratum.boundary?.coordinates ?? [],
              },
              label: stratum.name,
            })) ?? [],
          layerId: 'strata',
          style: strataLayerStyle,
          visible: selectedLayer === 'strata',
        },
        {
          features:
            plantingSite.strata?.flatMap((stratum) =>
              stratum.substrata.map((substratum) => ({
                featureId: `${substratum.id}`,
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: substratum.boundary?.coordinates ?? [],
                },
                label: substratum.name,
              }))
            ) ?? [],
          layerId: 'substrata',
          style: substrataLayerStyle,
          visible: selectedLayer === 'substrata',
        },
      ];
    }
    return [];
  }, [
    adHocPlots,
    adHocPlotsLayerStyle,
    adHocPlotsVisible,
    allPlantingSites,
    monitoringPlots,
    permanentPlotsLayerStyle,
    permanentPlotsVisible,
    plantingSite,
    plantingSiteId,
    selectFeature,
    selectedFeature?.layerFeatureId.featureId,
    selectedFeature?.layerFeatureId.layerId,
    selectedHistory,
    selectedLayer,
    sitesLayerStyle,
    substrataLayerStyle,
    temporaryPlotsLayerStyle,
    temporaryPlotsVisible,
    strataLayerStyle,
  ]);

  const nameTags = useMemo((): MapNameTag[] | undefined => {
    if (plantingSiteId === undefined) {
      return allPlantingSites
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
              onClick: () => {
                selectPlantingSiteId(site.id);
                fitBounds(bbox);
              },
            };
          }
        })
        .filter((nameTag): nameTag is MapNameTag => nameTag !== undefined);
    } else if (plantingSite !== undefined && plantingSite.boundary !== undefined) {
      const points = plantingSite.boundary.coordinates
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

      return [
        {
          label: plantingSite.name,
          longitude,
          latitude,
          onClick: () => {
            fitBounds(bbox);
          },
        },
      ];
    }
  }, [allPlantingSites, fitBounds, plantingSite, plantingSiteId, selectPlantingSiteId]);

  const survivalRateHighlights = useMemo(() => {
    const lessThanFifty: MapLayerFeatureId[] = [];
    const lessThanSeventyFive: MapLayerFeatureId[] = [];
    const greaterThanSeventyFive: MapLayerFeatureId[] = [];

    if (selectedResults === undefined || selectedHistory === undefined) {
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

    const siteId = { layerId: 'sites', featureId: `${selectedHistory.plantingSiteId}` };
    sortFeatureBySurvivalRate(siteId, selectedResults.survivalRate);

    selectedResults.strata.forEach((stratum) => {
      const selectedStratumHistory = selectedHistory.strata.find(
        (stratumHistory) => stratumHistory.stratumId === stratum.stratumId
      );
      const stratumId = { layerId: 'strata', featureId: `${selectedStratumHistory?.stratumId}` };
      sortFeatureBySurvivalRate(stratumId, stratum.survivalRate);

      stratum.substrata.forEach((substratum) => {
        const selectedSubstratumistory = selectedStratumHistory?.substrata.find(
          (substratumistory) => substratumistory.substratumId === substratum.substratumId
        );
        const substratumId = { layerId: 'substrata', featureId: `${selectedSubstratumistory?.substratumId}` };
        sortFeatureBySurvivalRate(substratumId, substratum.survivalRate);
      });
    });

    return {
      lessThanFifty,
      lessThanSeventyFive,
      greaterThanSeventyFive,
    };
  }, [selectedHistory, selectedResults]);

  const highlights = useMemo((): MapHighlightGroup[] => {
    return [
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
  }, [survivalRate50To75, survivalRateHighlights, survivalRateLessThan50, survivalRateMoreThan75, survivalRateVisible]);

  const selectPhoto = useCallback(
    (monitoringPlotId: number, observationId: number, photo: ObservationMonitoringPlotPhotoWithGps) => () => {
      selectPhotos([{ monitoringPlotId, observationId, photo }]);
      selectPlants([]);
      setSelectedFeature(undefined);
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
      selectPhotos(photos);
      selectPlants([]);
      setSelectedFeature(undefined);
      setDrawerOpen(true);
    },
    [selectPhotos, selectPlants]
  );

  const selectPlant = useCallback(
    (monitoringPlotId: number, observationId: number, plant: RecordedPlant) => () => {
      selectPhotos([]);
      selectPlants([{ monitoringPlotId, observationId, plant }]);
      setSelectedFeature(undefined);
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
      selectPhotos([]);
      selectPlants(plants);
      setSelectedFeature(undefined);
      setDrawerOpen(true);
    },
    [selectPhotos, selectPlants]
  );

  const photoMarkers = useMemo((): MapMarker[] => {
    if (!selectedResults) {
      return [];
    }

    const hasGpsCoordinates = (photo: ObservationMonitoringPlotPhoto): photo is ObservationMonitoringPlotPhotoWithGps =>
      !!photo.gpsCoordinates;

    const adHocPlotPhotos = adHocPlots.flatMap((plot): MapMarker[] =>
      plot.photos.filter(hasGpsCoordinates).map((photo) => {
        return {
          id: `photos/${photo.fileId}`,
          longitude: photo.gpsCoordinates?.coordinates[1],
          latitude: photo.gpsCoordinates?.coordinates[0],
          onClick: selectPhoto(plot.monitoringPlotId, selectedResults.observationId, photo),
          selected: selectedPhotos.find((selected) => selected.photo.fileId === photo.fileId) !== undefined,
          properties: {
            adHocPlotId: plot.monitoringPlotId,
            photo,
          },
        };
      })
    );
    const monitoringPlotPhotos = selectedResults.strata
      .flatMap((stratum) => stratum.substrata)
      .flatMap((substratum) => substratum.monitoringPlots)
      .flatMap((plot): MapMarker[] =>
        plot.photos.filter(hasGpsCoordinates).map((photo) => {
          return {
            id: `photos/${photo.fileId}`,
            longitude: photo.gpsCoordinates?.coordinates[1],
            latitude: photo.gpsCoordinates?.coordinates[0],
            onClick: selectPhoto(plot.monitoringPlotId, selectedResults.observationId, photo),
            selected: selectedPhotos.find((selected) => selected.photo.fileId === photo.fileId) !== undefined,
            properties: {
              monitoringPlotId: plot.monitoringPlotId,
              observationId: selectedResults.observationId,
              photo,
            },
          };
        })
      );

    return [...adHocPlotPhotos, ...monitoringPlotPhotos];
  }, [adHocPlots, selectPhoto, selectedPhotos, selectedResults]);

  const treesMarkers = useCallback(
    (isDead: boolean): MapMarker[] => {
      if (isBiomass) {
        return adHocObservationResults.flatMap((observation) => {
          const trees = observation.biomassMeasurements?.trees ?? [];
          return trees
            .filter((tree) => tree.isDead === isDead)
            .map((tree): MapMarker | undefined => {
              if (tree.gpsCoordinates) {
                return {
                  id: `trees/${tree.id}`,
                  longitude: tree.gpsCoordinates.coordinates[1],
                  latitude: tree.gpsCoordinates.coordinates[0],
                };
              } else {
                return undefined;
              }
            })
            .filter((marker): marker is MapMarker => marker !== undefined);
        });
      } else {
        return [];
      }
    },
    [adHocObservationResults, isBiomass]
  );

  const plantsMarkers = useCallback(
    (status: RecordedPlantStatus): MapMarker[] => {
      if (selectedResults === undefined) {
        return [];
      }
      if (!isBiomass) {
        const monitoringPlotPlants = selectedResults.strata
          .flatMap((stratum) => stratum.substrata)
          .flatMap((substratum) => substratum.monitoringPlots)
          .flatMap((plot): MapMarker[] => {
            if (plot.plants) {
              const filteredPlants = plot.plants.filter((plant) => plant.status === status);
              return filteredPlants.map(
                (plant): MapMarker => ({
                  id: `plants/${plant.id}`,
                  longitude: plant.gpsCoordinates.coordinates[1],
                  latitude: plant.gpsCoordinates.coordinates[0],
                  onClick: selectPlant(plot.monitoringPlotId, selectedResults.observationId, plant),
                  selected: selectedPlants.find((selected) => selected.plant.id === plant.id) !== undefined,
                  properties: {
                    monitoringPlotId: plot.monitoringPlotId,
                    observationId: selectedResults.observationId,
                    plant,
                  },
                })
              );
            } else {
              return [];
            }
          });
        const adHocPlotPlants = adHocPlots.flatMap((plot): MapMarker[] => {
          if (plot.plants) {
            const filteredPlants = plot.plants.filter((plant) => plant.status === status);
            return filteredPlants.map(
              (plant): MapMarker => ({
                id: `plants/${plant.id}`,
                longitude: plant.gpsCoordinates.coordinates[1],
                latitude: plant.gpsCoordinates.coordinates[0],
                properties: {
                  monitoringPlotId: plot.monitoringPlotId,
                  observationId: selectedResults.observationId,
                  plant,
                },
              })
            );
          } else {
            return [];
          }
        });

        return [...adHocPlotPlants, ...monitoringPlotPlants];
      } else {
        return [];
      }
    },
    [adHocPlots, isBiomass, selectPlant, selectedPlants, selectedResults]
  );

  const markers = useMemo((): MapMarkerGroup[] => {
    return [
      {
        markers: photoMarkers,
        markerGroupId: 'plot-photos',
        onClusterClick: selectPhotosFromMarkers,
        style: plotPhotoStyle,

        visible: plotPhotosVisible,
      },
      {
        markers: plantsMarkers('Live'),
        markerGroupId: 'live-plants',
        onClusterClick: selectPlantsFromMarkers,
        style: livePlantStyle,
        visible: livePlantsVisible,
      },
      {
        markers: plantsMarkers('Dead'),
        markerGroupId: 'dead-plants',
        onClusterClick: selectPlantsFromMarkers,
        style: deadPlantStyle,
        visible: deadPlantsVisible,
      },
      {
        markers: treesMarkers(true),
        markerGroupId: 'live-trees',
        style: {
          iconColor: '#40B0A6',
          iconName: 'iconLivePlant',
          type: 'icon',
        },
        visible: livePlantsVisible,
      },
      {
        markers: treesMarkers(false),
        markerGroupId: 'dead-trees',
        style: {
          iconColor: '#E1BE6A',
          iconName: 'iconLivePlant',
          type: 'icon',
        },
        visible: deadPlantsVisible,
      },
    ];
  }, [
    deadPlantStyle,
    deadPlantsVisible,
    livePlantStyle,
    livePlantsVisible,
    photoMarkers,
    plantsMarkers,
    plotPhotoStyle,
    plotPhotosVisible,
    selectPhotosFromMarkers,
    selectPlantsFromMarkers,
    treesMarkers,
  ]);

  const legends = useMemo((): MapLegendGroup[] => {
    const siteLegendGroup =
      plantingSiteId === undefined
        ? {
            ...plantingSiteLegendGroup,
            selectedLayer: 'sites',
          }
        : plantingSiteLegendGroup;

    return [
      siteLegendGroup,
      monitoringPlotsLegendGroup,
      plotPhotosLegendGroup,
      plantMakersLegendGroup,
      !isBiomass ? survivalRateLegendGroup : undefined,
    ].filter((group): group is MapLegendGroup => group !== undefined);
  }, [
    plantingSiteId,
    plantingSiteLegendGroup,
    monitoringPlotsLegendGroup,
    plotPhotosLegendGroup,
    plantMakersLegendGroup,
    isBiomass,
    survivalRateLegendGroup,
  ]);

  const drawerContent = useMemo(() => {
    if (selectedFeature && selectedResults) {
      return (
        <ObservationStatsDrawer
          layerFeatureId={selectedFeature.layerFeatureId}
          observationId={selectedResults.observationId}
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
  }, [
    photoDrawerContent,
    plantDrawerContent,
    selectedFeature,
    selectedPhotos.length,
    selectedPlants.length,
    selectedResults,
  ]);

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

  const setDrawerOpenCallback = useCallback(
    (open: boolean) => {
      if (open) {
        setDrawerOpen(true);
      } else {
        setDrawerOpen(false);
        selectPhotos([]);
        selectPlants([]);
      }
    },
    [selectPhotos, selectPlants]
  );

  return (
    <MapComponent
      clusterMaxZoom={20}
      drawerChildren={drawerContent}
      drawerHeader={drawerHeader}
      drawerOpen={drawerOpen}
      drawerSize={drawerSize}
      legends={legends}
      mapHighlights={highlights}
      mapMarkers={markers}
      mapId={mapId}
      mapLayers={layers}
      mapRef={mapRef}
      nameTags={nameTags}
      token={token ?? ''}
      setDrawerOpen={setDrawerOpenCallback}
    />
  );
};

export default ObservationMap;
