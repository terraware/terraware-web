import React, { type JSX, useEffect, useMemo, useRef } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box } from '@mui/material';

import MapComponent from 'src/components/NewMap';
import { MapLegendGroup } from 'src/components/NewMap/MapLegend';
import { MapLayer, MapLayerFeature } from 'src/components/NewMap/types';
import useMapFeatureStyles from 'src/components/NewMap/useMapFeatureStyles';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import usePlantingSiteMapLegend from 'src/components/NewMap/usePlantingSiteMapLegend';
import { getBoundingBoxFromMultiPolygons } from 'src/components/NewMap/utils';
import usePlantingSite from 'src/hooks/usePlantingSite';
import useMapboxToken from 'src/utils/useMapboxToken';

export type PlantingSiteMapV2Props = {
  plantingSiteId: number;
};

const PlantingSiteMapV2 = ({ plantingSiteId }: PlantingSiteMapV2Props): JSX.Element => {
  const { mapId, refreshToken, token } = useMapboxToken();
  const mapRef = useRef<MapRef | null>(null);
  const { fitBounds } = useMapUtils(mapRef);

  const { plantingSite } = usePlantingSite(plantingSiteId);
  const { selectedLayer, plantingSiteLegendGroup } = usePlantingSiteMapLegend('strata');
  const { sitesLayerStyle, strataLayerStyle, substrataLayerStyle } = useMapFeatureStyles();

  const layers = useMemo((): MapLayer[] => {
    if (!plantingSite?.boundary) {
      return [];
    }

    const strata = plantingSite.strata ?? [];
    const substrata = strata.flatMap((stratum) => stratum.substrata);

    const siteFeatures: MapLayerFeature[] = [
      {
        featureId: `${plantingSite.id}`,
        geometry: { type: 'MultiPolygon', coordinates: plantingSite.boundary.coordinates },
      },
    ];

    const stratumFeatures: MapLayerFeature[] = strata.map((stratum) => ({
      featureId: `${stratum.id}`,
      label: stratum.name,
      geometry: { type: 'MultiPolygon', coordinates: stratum.boundary.coordinates },
    }));

    const substratumFeatures: MapLayerFeature[] = substrata.map((substratum) => ({
      featureId: `${substratum.id}`,
      label: substratum.name,
      geometry: { type: 'MultiPolygon', coordinates: substratum.boundary.coordinates },
    }));

    return [
      { features: siteFeatures, layerId: 'sites', style: sitesLayerStyle, visible: selectedLayer === 'sites' },
      { features: stratumFeatures, layerId: 'strata', style: strataLayerStyle, visible: selectedLayer === 'strata' },
      {
        features: substratumFeatures,
        layerId: 'substrata',
        style: substrataLayerStyle,
        visible: selectedLayer === 'substrata',
      },
    ];
  }, [plantingSite, selectedLayer, sitesLayerStyle, strataLayerStyle, substrataLayerStyle]);

  const legends = useMemo((): MapLegendGroup[] => [plantingSiteLegendGroup], [plantingSiteLegendGroup]);

  useEffect(() => {
    if (plantingSite?.boundary) {
      fitBounds(getBoundingBoxFromMultiPolygons([plantingSite.boundary]));
    }
  }, [fitBounds, plantingSite]);

  if (!token) {
    return <Box />;
  }

  return (
    <MapComponent
      legends={legends}
      mapId={mapId}
      mapLayers={layers}
      mapRef={mapRef}
      onTokenExpired={refreshToken}
      token={token}
    />
  );
};

export default PlantingSiteMapV2;
