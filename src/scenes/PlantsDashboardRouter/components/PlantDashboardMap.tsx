import React, { useCallback, useMemo } from 'react';

import MapComponent, { MapFeatureSection } from 'src/components/NewMap';
import { MapLayer, MapLayerFeatureId, MapMarker } from 'src/components/NewMap/types';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { MapService } from 'src/services';
import { PlantingSite } from 'src/types/Tracking';
import useMapboxToken from 'src/utils/useMapboxToken';

const PlantDashboardMap = (): JSX.Element => {
  const { token, mapId } = useMapboxToken();
  const { strings } = useLocalization();

  const { latestResult, plantingSite } = usePlantingSiteData();

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
            },
          ],
          label: strings.SITE,
          layerId: 'sites',
          style: {
            borderColor: '#41C07F',
            fillColor: '#41C07F',
            opacity: 0.2,
            type: 'fill',
          },
        },
        {
          features: zones.map((zone) => ({
            featureId: `${zone.id}`,
            label: zone.name,
            geometry: {
              type: 'MultiPolygon',
              coordinates: zone.boundary.coordinates,
            },
          })),
          label: strings.ZONES,
          layerId: 'zones',
          style: {
            borderColor: '#BD9FDA',
            fillColor: '#BD9FDA',
            opacity: 0.2,
            type: 'fill',
          },
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
            })) ?? [],
          label: strings.SUBZONES,
          layerId: 'subzones',
          style: {
            borderColor: '#9EA9D7',
            fillColor: '#9EA9D7',
            opacity: 0.2,
            type: 'fill',
          },
        },
      ];
    },
    [strings]
  );

  const layers = useMemo(() => {
    if (!plantingSite) {
      return [];
    }
    if (!latestResult) {
      return extractLayersFromSite(plantingSite);
    } else {
      return extractLayersFromSite(plantingSite);
    }
  }, [extractLayersFromSite, latestResult, plantingSite]);

  const photoMarkers = useMemo((): MapMarker[] => {
    if (!latestResult) {
      return [];
    }

    return latestResult.plantingZones
      .flatMap((zone) => zone.plantingSubzones)
      .flatMap((subzone) => subzone.monitoringPlots)
      .flatMap((plot) => plot.photos)
      .map(
        (photo): MapMarker => ({
          id: `${photo.fileId}`,
          longitude: photo.gpsCoordinates.coordinates[1],
          latitude: photo.gpsCoordinates.coordinates[0],
        })
      );
  }, [latestResult]);

  const mortalityRateHighlights = useMemo(() => {
    const lessThanTwentyFive: MapLayerFeatureId[] = [];
    const lessThanFifty: MapLayerFeatureId[] = [];
    const greaterThanFifty: MapLayerFeatureId[] = [];

    if (!latestResult) {
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

    const siteId = { layerId: 'sites', featureId: `${latestResult.plantingSiteId}` };
    sortFeatureByMortalityRate(siteId, latestResult.mortalityRate);

    latestResult.plantingZones.forEach((zone) => {
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
  }, [latestResult]);

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
            markers: [],
            markerGroupId: 'live-plants',
            style: {
              iconColor: '#40B0A6',
              iconName: 'iconLivePlant',
              type: 'icon',
            },
          },
          {
            label: strings.DEAD_PLANTS,
            markers: [],
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
                fillColor: '#E7B9CD',
                opacity: 0.9,
                type: 'fill',
              },
            },
            {
              featureIds: observationEventsHighlights[1],
              style: {
                fillColor: '#E7B9CD',
                opacity: 0.7,
                type: 'fill',
              },
            },
            {
              featureIds: observationEventsHighlights[2],
              style: {
                fillColor: '#E7B9CD',
                opacity: 0.5,
                type: 'fill',
              },
            },
            {
              featureIds: observationEventsHighlights[3],
              style: {
                fillColor: '#E7B9CD',
                opacity: 0.3,
                type: 'fill',
              },
            },
            {
              featureIds: observationEventsHighlights[4],
              style: {
                fillColor: '#E7B9CD',
                opacity: 0.1,
                type: 'fill',
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
              fillColor: '#E7B9CD',
              opacity: 1.0,
              type: 'fill',
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
  }, [layers, mortalityRateHighlights, observationEventsHighlights, photoMarkers, strings]);

  return <MapComponent features={mapFeatures} initialSelectedLayerId={'zones'} mapId={mapId} token={token ?? ''} />;
};

export default PlantDashboardMap;
