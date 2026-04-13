import React, { type JSX, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import MapComponent from 'src/components/NewMap';
import { MapLegendGroup } from 'src/components/NewMap/MapLegend';
import { MapLayer, MapNameTag, MapPoint } from 'src/components/NewMap/types';
import useMapFeatureStyles from 'src/components/NewMap/useMapFeatureStyles';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import usePlantingSiteMapLegend from 'src/components/NewMap/usePlantingSiteMapLegend';
import usePlotPhotosMapLegend from 'src/components/NewMap/usePlotPhotosMapLegend';
import { getBoundingBoxFromPoints } from 'src/components/NewMap/utils';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import useMapboxToken from 'src/utils/useMapboxToken';

export default function VirtualWalkthroughsMap(): JSX.Element {
  const mapRef = useRef<MapRef | null>(null);
  const { mapId, token } = useMapboxToken();
  const { fitBounds } = useMapUtils(mapRef);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { plantingSites } = useOrganizationPlantingSites({ full: true });

  const { selectedLayer, plantingSiteLegendGroup } = usePlantingSiteMapLegend('sites');
  const { plotPhotosLegendGroup } = usePlotPhotosMapLegend();
  const { sitesLayerStyle, strataLayerStyle, substrataLayerStyle } = useMapFeatureStyles();

  useEffect(() => {
    if (mapLoaded && plantingSites.length) {
      const points = plantingSites.flatMap(
        (site) =>
          site.boundary?.coordinates
            .flat()
            .flat()
            .map(([lng, lat]): MapPoint => ({ lat, lng })) ?? []
      );
      if (points.length) {
        fitBounds(getBoundingBoxFromPoints(points));
      }
    }
  }, [fitBounds, mapLoaded, plantingSites]);

  const layers = useMemo((): MapLayer[] => {
    return [
      {
        features: plantingSites.flatMap((site) =>
          (site.strata ?? []).flatMap((stratum) =>
            (stratum.substrata ?? []).map((substratum) => ({
              featureId: `${substratum.id}`,
              geometry: {
                type: 'MultiPolygon' as const,
                coordinates: substratum.boundary?.coordinates ?? [],
              },
            }))
          )
        ),
        layerId: 'substrata',
        style: substrataLayerStyle,
        visible: selectedLayer === 'substrata',
      },
      {
        features: plantingSites.flatMap((site) =>
          (site.strata ?? []).map((stratum) => ({
            featureId: `${stratum.id}`,
            geometry: {
              type: 'MultiPolygon' as const,
              coordinates: stratum.boundary?.coordinates ?? [],
            },
          }))
        ),
        layerId: 'strata',
        style: strataLayerStyle,
        visible: selectedLayer === 'strata',
      },
      {
        features: plantingSites.map((site) => ({
          featureId: `${site.id}`,
          geometry: {
            type: 'MultiPolygon' as const,
            coordinates: site.boundary?.coordinates ?? [],
          },
        })),
        layerId: 'sites',
        style: sitesLayerStyle,
        visible: selectedLayer === 'sites' || selectedLayer === undefined,
      },
    ];
  }, [plantingSites, selectedLayer, sitesLayerStyle, strataLayerStyle, substrataLayerStyle]);

  const nameTags = useMemo((): MapNameTag[] => {
    return plantingSites
      .map((site): MapNameTag | undefined => {
        if (!site.boundary) {
          return undefined;
        }
        const points = site.boundary.coordinates
          .flat()
          .flat()
          .map(([lng, lat]): MapPoint => ({ lat, lng }));
        const bbox = getBoundingBoxFromPoints(points);
        return {
          label: site.name,
          longitude: (bbox.maxLng + bbox.minLng) / 2,
          latitude: (bbox.maxLat + bbox.minLat) / 2,
        };
      })
      .filter((tag): tag is MapNameTag => tag !== undefined);
  }, [plantingSites]);

  const legends = useMemo((): MapLegendGroup[] => {
    return [plantingSiteLegendGroup, plotPhotosLegendGroup];
  }, [plantingSiteLegendGroup, plotPhotosLegendGroup]);

  return (
    <MapComponent
      mapId={mapId}
      mapRef={mapRef}
      token={token ?? ''}
      mapLayers={layers}
      nameTags={nameTags}
      legends={legends}
      onMapLoad={() => setMapLoaded(true)}
    />
  );
}
