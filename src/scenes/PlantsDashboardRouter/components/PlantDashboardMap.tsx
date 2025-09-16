import React, { useCallback, useMemo, useState } from 'react';

import { useTheme } from '@mui/material';

import MapComponent, { MapFeatureSection } from 'src/components/NewMap';
import { MapDrawerSize } from 'src/components/NewMap/MapDrawer';
import { MapFillComponentStyle, MapLayer, MapLayerFeatureId, MapMarker } from 'src/components/NewMap/types';
import useObservation from 'src/hooks/useObservation';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { MapService } from 'src/services';
import { ObservationMonitoringPlotPhoto, RecordedPlant, RecordedPlantStatus } from 'src/types/Observations';
import { PlantingSite } from 'src/types/Tracking';
import useMapboxToken from 'src/utils/useMapboxToken';

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

const PlantDashboardMap = (): JSX.Element => {
  const { token, mapId } = useMapboxToken();
  const { strings } = useLocalization();
  const theme = useTheme();

  const [selectedFeaturedId, setSelectedFeatureId] = useState<MapLayerFeatureId>();
  const [selectedPhoto, setSelectedPhoto] = useState<PlotPhoto>();
  const [selectedPlant, setSelectedPlant] = useState<PlotPlant>();
  const { latestResult, plantingSite } = usePlantingSiteData();
  const { observationResults } = useObservation(latestResult?.observationId);

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
  const [drawerTitle, setDrawerTitle] = useState<string>();

  const selectFeature = useCallback(
    (layerId: string, featureId: string) => () => {
      setSelectedFeatureId({ layerId, featureId });
      setSelectedPhoto(undefined);
      setDrawerOpen(true);
      setDrawerSize('small');
      setDrawerTitle(undefined);
    },
    []
  );

  const selectPhoto = useCallback(
    (monitoringPlotId: number, observationId: number, photo: ObservationMonitoringPlotPhoto) => () => {
      setSelectedFeatureId(undefined);
      setSelectedPhoto({ monitoringPlotId, observationId, photo });
      setSelectedPlant(undefined);
      setDrawerOpen(true);
      setDrawerSize('medium');
      setDrawerTitle(undefined);
    },
    []
  );

  const selectPlant = useCallback(
    (monitoringPlotId: number, observationId: number, plant: RecordedPlant) => () => {
      setSelectedFeatureId(undefined);
      setSelectedPhoto(undefined);
      setSelectedPlant({ monitoringPlotId, observationId, plant });
      setDrawerOpen(true);
      setDrawerSize('small');
      setDrawerTitle(undefined);
    },
    []
  );

  const drawerContent = useMemo(() => {
    if (selectedFeaturedId) {
      return <MapStatsDrawer layerId={selectedFeaturedId.layerId} featureId={selectedFeaturedId.featureId} />;
    }
    if (selectedPhoto) {
      return (
        <MapPhotoDrawer
          monitoringPlotId={selectedPhoto.monitoringPlotId}
          observationId={selectedPhoto.observationId}
          photo={selectedPhoto.photo}
        />
      );
    }
    if (selectedPlant) {
      return (
        <MapPlantDrawer
          monitoringPlotId={selectedPlant.monitoringPlotId}
          observationId={selectedPlant.observationId}
          plant={selectedPlant.plant}
        />
      );
    }
  }, [selectedFeaturedId, selectedPhoto, selectedPlant]);

  const extractLayersFromSite = useCallback(
    (site: PlantingSite): MapLayer[] => {
      const zones = site.plantingZones ?? [];
      const subzones = site.plantingZones?.flatMap((zone) => zone.plantingSubzones);

      return [
        {
          features: [
            {
              featureId: `${site.id}`,
              label: site.name,
              geometry: {
                type: 'MultiPolygon',
                coordinates: site.boundary?.coordinates ?? [],
              },
              onClick: selectFeature('sites', `${site.id}`),
              selected: selectedFeaturedId?.layerId === 'sites' && selectedFeaturedId?.featureId === `${site.id}`,
            },
          ],
          label: strings.SITE,
          layerId: 'sites',
          style: sitesLayerStyle,
        },
        {
          features: zones.map((zone) => ({
            featureId: `${zone.id}`,
            label: zone.name,
            geometry: {
              type: 'MultiPolygon',
              coordinates: zone.boundary.coordinates,
            },
            onClick: selectFeature('zones', `${zone.id}`),
            selected: selectedFeaturedId?.layerId === 'zones' && selectedFeaturedId?.featureId === `${zone.id}`,
          })),
          label: strings.ZONES,
          layerId: 'zones',
          style: zonesLayerStyle,
        },
        {
          features:
            subzones?.map((subzone) => ({
              featureId: `${subzone.id}`,
              label: subzone.name,
              geometry: {
                type: 'MultiPolygon',
                coordinates: subzone.boundary.coordinates,
              },
              onClick: selectFeature('subzones', `${subzone.id}`),
              selected: selectedFeaturedId?.layerId === 'subzones' && selectedFeaturedId?.featureId === `${subzone.id}`,
            })) ?? [],
          label: strings.SUBZONES,
          layerId: 'subzones',
          style: subzonesLayerStyle,
        },
      ];
    },
    [selectFeature, selectedFeaturedId, sitesLayerStyle, strings, subzonesLayerStyle, zonesLayerStyle]
  );

  const layers = useMemo(() => {
    if (!plantingSite) {
      return [];
    }
    if (!observationResults) {
      return extractLayersFromSite(plantingSite);
    } else {
      return extractLayersFromSite(plantingSite);
    }
  }, [extractLayersFromSite, observationResults, plantingSite]);

  const photoMarkers = useMemo((): MapMarker[] => {
    if (!observationResults) {
      return [];
    }

    return observationResults.plantingZones
      .flatMap((zone) => zone.plantingSubzones)
      .flatMap((subzone) => subzone.monitoringPlots)
      .flatMap((plot): MapMarker[] =>
        plot.photos.map((photo) => {
          return {
            id: `${photo.fileId}`,
            longitude: photo.gpsCoordinates.coordinates[1],
            latitude: photo.gpsCoordinates.coordinates[0],
            onClick: selectPhoto(plot.monitoringPlotId, observationResults.observationId, photo),
            selected: selectedPhoto && photo.fileId === selectedPhoto.photo.fileId,
          };
        })
      );
  }, [observationResults, selectPhoto, selectedPhoto]);

  const plantsMarkers = useCallback(
    (status: RecordedPlantStatus): MapMarker[] => {
      if (!observationResults) {
        return [];
      }

      return observationResults.plantingZones
        .flatMap((zone) => zone.plantingSubzones)
        .flatMap((subzone) => subzone.monitoringPlots)
        .flatMap((plot): MapMarker[] => {
          if (plot.plants) {
            const filteredPlants = plot.plants.filter((plant) => plant.status === status);
            return filteredPlants.map(
              (plant): MapMarker => ({
                id: `${plant.id}`,
                longitude: plant.gpsCoordinates.coordinates[1],
                latitude: plant.gpsCoordinates.coordinates[0],
                onClick: selectPlant(plot.monitoringPlotId, observationResults.observationId, plant),
                selected: selectedPlant && selectedPlant.plant.id === plant.id,
              })
            );
          } else {
            return [];
          }
        });
    },
    [observationResults, selectPlant, selectedPlant]
  );

  const mortalityRateHighlights = useMemo(() => {
    const lessThanTwentyFive: MapLayerFeatureId[] = [];
    const lessThanFifty: MapLayerFeatureId[] = [];
    const greaterThanFifty: MapLayerFeatureId[] = [];

    if (!observationResults) {
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

    const siteId = { layerId: 'sites', featureId: `${observationResults.plantingSiteId}` };
    sortFeatureByMortalityRate(siteId, observationResults.mortalityRate);

    observationResults.plantingZones.forEach((zone) => {
      const zoneId = { layerId: 'zones', featureId: `${zone.plantingZoneId}` };
      sortFeatureByMortalityRate(zoneId, zone.mortalityRate);
      zone.plantingSubzones.forEach((subzone) => {
        const subzoneId = { layerId: 'subzones', featureId: `${subzone.plantingSubzoneId}` };
        sortFeatureByMortalityRate(subzoneId, subzone.mortalityRate);
      });
    });

    return {
      lessThanTwentyFive,
      lessThanFifty,
      greaterThanFifty,
    };
  }, [observationResults]);

  const setDrawerOpenCallback = useCallback((open: boolean) => {
    if (open) {
      setDrawerOpen(true);
    } else {
      setDrawerOpen(false);
      setSelectedFeatureId(undefined);
      setSelectedPhoto(undefined);
      setSelectedPlant(undefined);
    }
  }, []);

  const observationEventsHighlights = useMemo((): MapLayerFeatureId[][] => {
    const recencyHighlights: MapLayerFeatureId[][] = [[], [], [], [], []];

    if (!plantingSite) {
      return recencyHighlights;
    }

    const sortFeatureByObservationRecency = (featureId: MapLayerFeatureId, time: string | undefined) => {
      if (time !== undefined) {
        const recency = MapService.getRecencyFromTime(time);
        recencyHighlights[recency - 1].push(featureId);
      }
    };

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

    return recencyHighlights;
  }, [plantingSite]);

  const baseObservationEventStyle = useMemo(
    (): MapFillComponentStyle => ({
      fillColor: theme.palette.TwClrBasePink200,
      type: 'fill',
    }),
    [theme]
  );

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
            style: {
              iconColor: '#CC79A7',
              iconName: 'iconPhoto',
              type: 'icon',
            },
          },
        ],
        sectionTitle: strings.PHOTOS,
        type: 'marker',
      },
      {
        groups: [
          {
            label: strings.LIVE_PLANTS,
            markers: plantsMarkers('Live'),
            markerGroupId: 'live-plants',
            style: {
              iconColor: '#40B0A6',
              iconName: 'iconLivePlant',
              type: 'icon',
            },
          },
          {
            label: strings.DEAD_PLANTS,
            markers: plantsMarkers('Dead'),
            markerGroupId: 'dead-plants',
            style: {
              iconColor: '#E1BE6A',
              iconName: 'iconLivePlant',
              type: 'icon',
            },
          },
        ],
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
        },
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
        },
        sectionTitle: strings.MORTALITY_RATE,
        legendItems: [
          {
            label: strings.LESS_THAN_TWENTY_FIVE_PERCENT,
            style: {
              fillPatternUrl: '/assets/mortality-rate-less-25.png',
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
              fillPatternUrl: '/assets/mortality-rate-more-50.png',
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
    layers,
    mortalityRateHighlights.greaterThanFifty,
    mortalityRateHighlights.lessThanFifty,
    mortalityRateHighlights.lessThanTwentyFive,
    observationEventsHighlights,
    photoMarkers,
    plantsMarkers,
    strings,
  ]);

  return (
    <MapComponent
      drawerChildren={drawerContent}
      drawerOpen={drawerOpen}
      drawerSize={drawerSize}
      drawerTitle={drawerTitle}
      features={mapFeatures}
      initialSelectedLayerId={'zones'}
      mapId={mapId}
      token={token ?? ''}
      setDrawerOpen={setDrawerOpenCallback}
    />
  );
};

export default PlantDashboardMap;
