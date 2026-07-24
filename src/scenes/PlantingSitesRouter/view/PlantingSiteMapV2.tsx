import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box } from '@mui/material';

import MapComponent from 'src/components/NewMap';
import { MapLegendGroup } from 'src/components/NewMap/MapLegend';
import { MapLayer, MapLayerFeature, MapLayerFeatureId } from 'src/components/NewMap/types';
import useMapFeatureStyles from 'src/components/NewMap/useMapFeatureStyles';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import usePlantingSiteMapLegend from 'src/components/NewMap/usePlantingSiteMapLegend';
import { getBoundingBoxFromMultiPolygons } from 'src/components/NewMap/utils';
import usePlantingSite from 'src/hooks/usePlantingSite';
import useMapboxToken from 'src/utils/useMapboxToken';

import PlantingSiteMapDrawer from './PlantingSiteMapDrawer';

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

  const [selectedFeature, setSelectedFeature] = useState<MapLayerFeatureId>();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const selectFeature = useCallback(
    (layerId: string, featureId: string) => () => {
      setSelectedFeature({ layerId, featureId });
      setDrawerOpen(true);
    },
    []
  );

  const isSelected = useCallback(
    (layerId: string, featureId: string) =>
      selectedFeature?.layerId === layerId && selectedFeature?.featureId === featureId,
    [selectedFeature]
  );

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
        onClick: selectFeature('sites', `${plantingSite.id}`),
        selected: isSelected('sites', `${plantingSite.id}`),
      },
    ];

    const stratumFeatures: MapLayerFeature[] = strata.map((stratum) => ({
      featureId: `${stratum.id}`,
      label: stratum.name,
      geometry: { type: 'MultiPolygon', coordinates: stratum.boundary.coordinates },
      onClick: selectFeature('strata', `${stratum.id}`),
      selected: isSelected('strata', `${stratum.id}`),
    }));

    const substratumFeatures: MapLayerFeature[] = substrata.map((substratum) => ({
      featureId: `${substratum.id}`,
      label: substratum.name,
      geometry: { type: 'MultiPolygon', coordinates: substratum.boundary.coordinates },
      onClick: selectFeature('substrata', `${substratum.id}`),
      selected: isSelected('substrata', `${substratum.id}`),
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
  }, [plantingSite, selectedLayer, selectFeature, isSelected, sitesLayerStyle, strataLayerStyle, substrataLayerStyle]);

  const legends = useMemo((): MapLegendGroup[] => [plantingSiteLegendGroup], [plantingSiteLegendGroup]);

  const drawerContent = useMemo(() => {
    if (selectedFeature) {
      return <PlantingSiteMapDrawer plantingSiteId={plantingSiteId} layerFeatureId={selectedFeature} />;
    }
    return undefined;
  }, [plantingSiteId, selectedFeature]);

  const setDrawerOpenCallback = useCallback((open: boolean) => {
    if (open) {
      setDrawerOpen(true);
    } else {
      setDrawerOpen(false);
      setSelectedFeature(undefined);
    }
  }, []);

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
      drawerChildren={drawerContent}
      drawerOpen={drawerOpen}
      drawerSize={'small'}
      legends={legends}
      mapId={mapId}
      mapLayers={layers}
      mapRef={mapRef}
      onTokenExpired={refreshToken}
      setDrawerOpen={setDrawerOpenCallback}
      token={token}
    />
  );
};

export default PlantingSiteMapV2;
