import React, { type JSX, useCallback, useMemo, useRef } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { MultiPolygon } from 'geojson';

import MapComponent from 'src/components/NewMap';
import { MapLayer, MapLayerFeature } from 'src/components/NewMap/types';
import useMapFeatureStyles from 'src/components/NewMap/useMapFeatureStyles';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import { getBoundingBoxFromMultiPolygons } from 'src/components/NewMap/utils';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import useMapboxToken from 'src/utils/useMapboxToken';

type DraftPlantingSiteBoundaryMapProps = {
  boundary: MultiPolygon;
  plantingSite: DraftPlantingSite;
};

const toLayer = (layerId: string, features: MapLayerFeature[], style: MapLayer['style']): MapLayer => ({
  features,
  layerId,
  style,
  visible: true,
});

export default function DraftPlantingSiteBoundaryMap({
  boundary,
  plantingSite,
}: DraftPlantingSiteBoundaryMapProps): JSX.Element {
  const { mapId, refreshToken, token } = useMapboxToken();
  const mapRef = useRef<MapRef | null>(null);
  const { fitBounds } = useMapUtils(mapRef);
  const { exclusionsLayerStyle, sitesLayerStyle, strataLayerStyle, substrataLayerStyle } = useMapFeatureStyles();

  const mapLayers = useMemo((): MapLayer[] => {
    const layers = [toLayer('site', [{ featureId: `${plantingSite.id}`, geometry: boundary }], sitesLayerStyle)];

    if (plantingSite.siteType === 'detailed' && plantingSite.strata) {
      const substrata = plantingSite.strata.flatMap((stratum) => stratum.substrata);
      layers.push(
        toLayer(
          'strata',
          plantingSite.strata.map((stratum) => ({ featureId: `${stratum.id}`, geometry: stratum.boundary })),
          strataLayerStyle
        ),
        toLayer(
          'substrata',
          substrata.map((substratum) => ({ featureId: `${substratum.id}`, geometry: substratum.boundary })),
          substrataLayerStyle
        )
      );
    }

    if (plantingSite.exclusion) {
      layers.push(
        toLayer('exclusions', [{ featureId: 'exclusion', geometry: plantingSite.exclusion }], exclusionsLayerStyle)
      );
    }

    return layers;
  }, [boundary, exclusionsLayerStyle, plantingSite, sitesLayerStyle, strataLayerStyle, substrataLayerStyle]);

  const onMapLoad = useCallback(() => {
    fitBounds(getBoundingBoxFromMultiPolygons([boundary]), 25);
  }, [boundary, fitBounds]);

  return (
    <MapComponent
      containerStyle={{ borderRadius: '8px', height: '240px', minHeight: '240px', width: '100%' }}
      fillContainerHeight
      hideFullScreenControl
      hideMapViewStyleControl
      mapId={mapId}
      mapLayers={mapLayers}
      mapRef={mapRef}
      onMapLoad={onMapLoad}
      onTokenExpired={refreshToken}
      token={token ?? ''}
    />
  );
}
