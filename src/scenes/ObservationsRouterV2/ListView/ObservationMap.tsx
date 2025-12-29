import React, { useEffect, useMemo, useRef } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import MapComponent from 'src/components/NewMap';
import { MapLegendGroup } from 'src/components/NewMap/MapLegend';
import { MapLayer, MapNameTag, MapPoint } from 'src/components/NewMap/types';
import useMapFeatureStyles from 'src/components/NewMap/useMapFeatureStyles';
import useMapUtils from 'src/components/NewMap/useMapUtils';
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
import useMapboxToken from 'src/utils/useMapboxToken';

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

  const { selectedLayer, plantingSiteLegendGroup } = usePlantingSiteMapLegend('sites', plantingSiteId === undefined);
  const { plantMakersLegendGroup } = usePlantMarkersMapLegend(plantingSiteId === undefined);
  const { plotPhotosLegendGroup } = usePlotPhotosMapLegend(plantingSiteId === undefined);
  const { survivalRateLegendGroup } = useSurvivalRateMapLegend(plantingSiteId === undefined);

  const { sitesLayerStyle, zonesLayerStyle, subzonesLayerStyle, adHocPlotsLayerStyle } = useMapFeatureStyles();

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
    } else {
      return undefined;
    }
  }, [observationResults]);

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
          features: [
            {
              featureId: `${selectedHistory.id}`,
              geometry: {
                type: 'MultiPolygon',
                coordinates: selectedHistory.boundary?.coordinates ?? [],
              },
            },
          ],
          layerId: 'sites',
          style: sitesLayerStyle,
          visible: selectedLayer === 'sites',
        },
        {
          features:
            selectedHistory.plantingZones?.map((zone) => ({
              featureId: `${zone.id}`,
              geometry: {
                type: 'MultiPolygon',
                coordinates: zone.boundary?.coordinates ?? [],
              },
              label: zone.name,
            })) ?? [],
          layerId: 'zones',
          style: zonesLayerStyle,
          visible: selectedLayer === 'zones',
        },
        {
          features:
            selectedHistory.plantingZones?.flatMap((zone) =>
              zone.plantingSubzones.map((subzone) => ({
                featureId: `${subzone.id}`,
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: subzone.boundary?.coordinates ?? [],
                },
                label: subzone.name,
              }))
            ) ?? [],
          layerId: 'subzones',
          style: subzonesLayerStyle,
          visible: selectedLayer === 'subzones',
        },
        {
          features: adHocPlots.map((plot) => ({
            featureId: `${plot.monitoringPlotId}`,
            geometry: {
              type: 'MultiPolygon',
              coordinates: [plot.boundary?.coordinates ?? []],
            },
            label: `${plot.monitoringPlotNumber}`,
          })),
          layerId: 'adHocPlots',
          style: adHocPlotsLayerStyle,
          visible: true,
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
            plantingSite.plantingZones?.map((zone) => ({
              featureId: `${zone.id}`,
              geometry: {
                type: 'MultiPolygon',
                coordinates: zone.boundary?.coordinates ?? [],
              },
              label: zone.name,
            })) ?? [],
          layerId: 'zones',
          style: zonesLayerStyle,
          visible: selectedLayer === 'zones',
        },
        {
          features:
            plantingSite.plantingZones?.flatMap((zone) =>
              zone.plantingSubzones.map((subzone) => ({
                featureId: `${subzone.id}`,
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: subzone.boundary?.coordinates ?? [],
                },
                label: subzone.name,
              }))
            ) ?? [],
          layerId: 'subzones',
          style: subzonesLayerStyle,
          visible: selectedLayer === 'subzones',
        },
        {
          features: adHocPlots.map((plot) => ({
            featureId: `${plot.monitoringPlotId}`,
            geometry: {
              type: 'MultiPolygon',
              coordinates: [plot.boundary?.coordinates ?? []],
            },
            label: `${plot.monitoringPlotNumber}`,
          })),
          layerId: 'adHocPlots',
          style: adHocPlotsLayerStyle,
          visible: true,
        },
      ];
    }
    return [];
  }, [
    adHocPlots,
    adHocPlotsLayerStyle,
    allPlantingSites,
    plantingSite,
    plantingSiteId,
    selectedHistory,
    selectedLayer,
    sitesLayerStyle,
    subzonesLayerStyle,
    zonesLayerStyle,
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

  const legends = useMemo((): MapLegendGroup[] => {
    const siteLegendGroup =
      plantingSiteId === undefined
        ? {
            ...plantingSiteLegendGroup,
            selectedLayer: 'sites',
          }
        : plantingSiteLegendGroup;

    return [siteLegendGroup, plotPhotosLegendGroup, plantMakersLegendGroup, survivalRateLegendGroup];
  }, [plantingSiteId, plantingSiteLegendGroup, plotPhotosLegendGroup, plantMakersLegendGroup, survivalRateLegendGroup]);

  return (
    <MapComponent
      legends={legends}
      mapLayers={layers}
      mapId={mapId}
      mapRef={mapRef}
      nameTags={nameTags}
      token={token ?? ''}
    />
  );
};

export default ObservationMap;
