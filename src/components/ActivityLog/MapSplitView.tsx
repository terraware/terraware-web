import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef, ViewStateChangeEvent } from 'react-map-gl/mapbox';
import { useSearchParams } from 'react-router';

import { Box, useTheme } from '@mui/material';

import MapComponent, { MapFeatureSection } from 'src/components/NewMap';
import ColorKeyControl from 'src/components/NewMap/ColorKeyControl';
import { MapLayerFeature, MapMarker, MapMarkerGroup, MapViewState } from 'src/components/NewMap/types';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import { getBoundingBox } from 'src/components/NewMap/utils';
import { useProjectPlantingSites } from 'src/hooks/useProjectPlantingSites';
import { useLocalization } from 'src/providers';
import { Activity, activityTypeColor } from 'src/types/Activity';
import useMapboxToken from 'src/utils/useMapboxToken';

type MapSplitViewProps = {
  activities?: Activity[];
  activityMarkerHighlighted?: (activityId: number, fileId: number) => boolean;
  children: React.ReactNode;
  drawerRef?: MutableRefObject<HTMLDivElement | null>;
  onActivityMarkerClick?: (activityId: number, fileId: number) => void;
  projectId: number;
  topComponent?: React.ReactNode;
};

export default function MapSplitView({
  activities,
  activityMarkerHighlighted,
  children,
  drawerRef,
  onActivityMarkerClick,
  projectId,
  topComponent,
}: MapSplitViewProps): JSX.Element {
  const theme = useTheme();
  const { mapId, refreshToken, token } = useMapboxToken();
  const { strings } = useLocalization();
  const mapRef = useRef<MapRef | null>(null);
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
      const markers = activity.media
        .map((media): MapMarker | undefined => {
          if (media.geolocation && !media.isHiddenOnMap) {
            return {
              id: `activity-${activity.id}-media-${media.fileId}`,
              longitude: media.geolocation.coordinates[0],
              latitude: media.geolocation.coordinates[1],
              onClick: onActivityMarkerClickCallback(activity.id, media.fileId),
              selected: activityMarkerHighlighted?.(activity.id, media.fileId) ?? false,
            };
          } else {
            return undefined;
          }
        })
        .filter((marker): marker is MapMarker => marker !== undefined);

      return {
        label: `Activity ${activity.id}`,
        markers,
        markerGroupId: `activity-${activity.id}`,
        style: {
          iconColor: activityTypeColor(activity.type),
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
          label: site.name,
          geometry: {
            type: 'MultiPolygon',
            coordinates: site.boundary?.coordinates ?? [],
          },
        })
      ) ?? []
    );
  }, [plantingSites]);

  const boundingBox = useMemo(() => {
    const multipolygons = siteFeatures.map((feature) => feature.geometry);
    return getBoundingBox(multipolygons);
  }, [siteFeatures]);

  const mapFeatures = useMemo((): MapFeatureSection[] => {
    return [
      {
        sectionTitle: strings.PHOTOS,
        groups: markerGroups,
        type: 'marker',
      },
      {
        layers: [
          {
            features: siteFeatures,
            label: strings.PLANTING_SITES,
            layerId: 'sites',
            style: {
              borderColor: theme.palette.TwClrBaseGreen300,
              fillColor: theme.palette.TwClrBaseGreen300,
              opacity: 0.2,
              type: 'fill',
            },
          },
        ],
        sectionTitle: strings.BOUNDARIES,
        type: 'layer',
      },
    ];
  }, [markerGroups, siteFeatures, strings, theme]);

  useEffect(() => {
    if (projectId !== currentProjectId) {
      setInitialMapViewState(undefined);
      setCurrentProjectId(projectId);
    }
  }, [currentProjectId, projectId, setSearchParams]);

  useEffect(() => {
    if (!initialMapViewState && boundingBox) {
      // If no map view state is provided, move map to features
      fitBounds(boundingBox);
    }
  }, [boundingBox, fitBounds, initialMapViewState]);

  const onMapMoveCallback = useCallback(
    (view: ViewStateChangeEvent) => {
      const params = new URLSearchParams(searchParams);
      params.set('lat', view.viewState.latitude.toString());
      params.set('lng', view.viewState.longitude.toString());
      params.set('zoom', view.viewState.zoom.toString());
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      {topComponent}

      <MapComponent
        drawerChildren={children}
        drawerHideHeader
        drawerOpen
        drawerRef={drawerRef}
        drawerSize='large'
        features={mapFeatures}
        hideLegend
        initialSelectedLayerId='sites'
        initialViewState={initialMapViewState}
        mapRef={mapRef}
        mapId={mapId}
        onMapMove={onMapMoveCallback}
        onTokenExpired={refreshToken}
        token={token ?? ''}
        controlTopLeft={<ColorKeyControl />}
      />
    </Box>
  );
}
