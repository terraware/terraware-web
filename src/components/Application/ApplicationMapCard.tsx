import React, { useCallback, useMemo, useRef } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, Card, useTheme } from '@mui/material';

import MapComponent from 'src/components/NewMap';
import { MapLayer } from 'src/components/NewMap/types';
import useMapFeatureStyles from 'src/components/NewMap/useMapFeatureStyles';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import { getBoundingBoxFromMultiPolygons } from 'src/components/NewMap/utils';
import { Application } from 'src/types/Application';
import useMapboxToken from 'src/utils/useMapboxToken';

type ApplicationMapCardProps = {
  application: Application;
};

const ApplicationMapCard = ({ application }: ApplicationMapCardProps) => {
  const theme = useTheme();
  const { mapId, refreshToken, token } = useMapboxToken();
  const mapRef = useRef<MapRef | null>(null);
  const { fitBounds } = useMapUtils(mapRef);
  const { sitesLayerStyle } = useMapFeatureStyles();

  const { boundary, id } = application;

  const mapLayers = useMemo(
    (): MapLayer[] | undefined =>
      boundary
        ? [
            {
              features: [{ featureId: `${id}`, geometry: boundary }],
              layerId: 'boundary',
              style: sitesLayerStyle,
              visible: true,
            },
          ]
        : undefined,
    [boundary, id, sitesLayerStyle]
  );

  const onMapLoad = useCallback(() => {
    if (boundary) {
      fitBounds(getBoundingBoxFromMultiPolygons([boundary]), 25);
    }
  }, [boundary, fitBounds]);

  return (
    <Card style={{ width: '100%', padding: theme.spacing(3), borderRadius: theme.spacing(3) }}>
      {mapLayers && (
        <Box display='flex' flexDirection='column' minHeight='640px'>
          <MapComponent
            containerStyle={{
              borderRadius: '24px',
              flexGrow: 1,
              height: 'auto',
              maxHeight: 'none',
              minHeight: '640px',
            }}
            mapId={mapId}
            mapLayers={mapLayers}
            mapRef={mapRef}
            onMapLoad={onMapLoad}
            onTokenExpired={refreshToken}
            token={token ?? ''}
          />
        </Box>
      )}
    </Card>
  );
};

export default ApplicationMapCard;
