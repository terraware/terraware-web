import React, { MutableRefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { MapRef, ViewStateChangeEvent } from 'react-map-gl/mapbox';
import { useSearchParams } from 'react-router';

import { Box, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import MapComponent from 'src/components/NewMap';
import ColorKeyControl from 'src/components/NewMap/ColorKeyControl';
import {
  MapLayer,
  MapLayerFeature,
  MapMarker,
  MapMarkerGroup,
  MapNameTag,
  MapPoint,
  MapViewState,
} from 'src/components/NewMap/types';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import { getBoundingBoxFromMultiPolygons, getBoundingBoxFromPoints } from 'src/components/NewMap/utils';
import { useProjectPlantingSites } from 'src/hooks/useProjectPlantingSites';
import { activityTypeColor } from 'src/types/Activity';
import useMapboxToken from 'src/utils/useMapboxToken';

import { TypedActivity } from './types';

type MapSplitViewProps = {
  activities?: TypedActivity[];
  activityMarkerHighlighted?: (activityId: number, fileId: number) => boolean;
  children: React.ReactNode;
  drawerRef?: MutableRefObject<HTMLDivElement | null>;
  heightOffsetPx: number;
  mapRef: MutableRefObject<MapRef | null>;
  onActivityMarkerClick?: (activityId: number, fileId: number) => void;
  projectId: number;
  topComponent?: React.ReactNode;
};

export default function MapSplitView({
  activities,
  activityMarkerHighlighted,
  children,
  drawerRef,
  heightOffsetPx,
  mapRef,
  onActivityMarkerClick,
  projectId,
  topComponent,
}: MapSplitViewProps): JSX.Element {
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();
  const { mapId, refreshToken, token } = useMapboxToken();
  const { fitBounds } = useMapUtils(mapRef);
  const { plantingSites } = useProjectPlantingSites(projectId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentProjectId, setCurrentProjectId] = useState(projectId);

  const onActivityMarkerClickCallback = useCallback(
    (activityId: number, fileId: number) => () => onActivityMarkerClick?.(activityId, fileId),
    [onActivityMarkerClick]
  );

  const [initialMapViewState, setInitialMapViewState] = useState((): MapViewState | undefined => {
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const zoomParam = searchParams.get('zoom');

    if (latParam && lngParam && zoomParam) {
      const latitude = Number(latParam);
      const longitude = Number(lngParam);
      const zoom = Number(zoomParam);

      if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(zoom)) {
        return {
          latitude,
          longitude,
          zoom,
        };
      }
    }
  });

  const markerGroups = useMemo((): MapMarkerGroup[] => {
    if (!activities) {
      return [];
    }

    return activities.map((activity): MapMarkerGroup => {
      const markers = activity.payload.media
        .map((media): MapMarker | undefined => {
          if (media.geolocation && !media.isHiddenOnMap) {
            return {
              id: `activity-${activity.payload.id}-media-${media.fileId}`,
              longitude: media.geolocation.coordinates[0],
              latitude: media.geolocation.coordinates[1],
              onClick: onActivityMarkerClickCallback(activity.payload.id, media.fileId),
              selected: activityMarkerHighlighted?.(activity.payload.id, media.fileId) ?? false,
            };
          } else {
            return undefined;
          }
        })
        .filter((marker): marker is MapMarker => marker !== undefined);

      return {
        label: `Activity ${activity.payload.id}`,
        markers,
        markerGroupId: `activity-${activity.payload.id}`,
        style: {
          iconColor: activityTypeColor(activity.payload.type),
          iconName: 'iconPhoto',
          type: 'icon',
        },
        visible: true,
      };
    });
  }, [activities, activityMarkerHighlighted, onActivityMarkerClickCallback]);

  const siteFeatures = useMemo((): MapLayerFeature[] => {
    return (
      plantingSites?.map(
        (site): MapLayerFeature => ({
          featureId: `${site.id}`,
          geometry: {
            type: 'MultiPolygon',
            coordinates: site.boundary?.coordinates ?? [],
          },
        })
      ) ?? []
    );
  }, [plantingSites]);

  const mapLayers = useMemo((): MapLayer[] => {
    return [
      {
        features: siteFeatures,
        layerId: 'sites',
        style: {
          borderColor: theme.palette.TwClrBaseGreen300,
          fillColor: theme.palette.TwClrBaseGreen300,
          opacity: 0.2,
          type: 'fill',
        },
        visible: true,
      },
    ];
  }, [siteFeatures, theme]);

  const nameTags = useMemo((): MapNameTag[] | undefined => {
    return plantingSites
      ?.map((site): MapNameTag | undefined => {
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

  useEffect(() => {
    if (projectId !== currentProjectId) {
      setInitialMapViewState(undefined);
      setCurrentProjectId(projectId);
    }
  }, [currentProjectId, projectId, setSearchParams]);

  useEffect(() => {
    if (!initialMapViewState && siteFeatures.length > 0) {
      // If no map view state is provided, move map to features
      const multipolygons = siteFeatures.map((feature) => feature.geometry);
      const boundingBox = getBoundingBoxFromMultiPolygons(multipolygons);
      fitBounds(boundingBox);
    }
  }, [fitBounds, initialMapViewState, siteFeatures]);

  const onMapMoveCallback = useCallback(
    (view: ViewStateChangeEvent) => {
      const params = new URLSearchParams(searchParams);
      params.set('lat', view.viewState.latitude.toString());
      params.set('lng', view.viewState.longitude.toString());
      params.set('zoom', view.viewState.zoom.toString());
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      {topComponent}

      <MapComponent
        containerStyle={
          isDesktop
            ? {
                height: `calc(100vh - ${heightOffsetPx}px)`,
                maxHeight: `calc(100vh - ${heightOffsetPx}px)`,
              }
            : undefined
        }
        drawerChildren={children}
        drawerHideHeader
        drawerOpen
        drawerRef={drawerRef}
        drawerSize='large'
        hideBorder
        initialViewState={initialMapViewState}
        mapRef={mapRef}
        mapMarkers={markerGroups}
        mapLayers={mapLayers}
        mapId={mapId}
        nameTags={nameTags}
        onMapMove={onMapMoveCallback}
        onTokenExpired={refreshToken}
        token={token ?? ''}
        controlTopLeft={<ColorKeyControl />}
      />
    </Box>
  );
}
