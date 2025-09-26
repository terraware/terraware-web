import React, { useCallback, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import MapComponent, { MapFeatureSection } from 'src/components/NewMap';
import { MapLayer, MapLayerFeature, MapMarker, MapMarkerGroup } from 'src/components/NewMap/types';
import { useProjectPlantingSites } from 'src/hooks/useProjectPlantingSites';
import { useLocalization } from 'src/providers';
import { Activity, activityTypeColor } from 'src/types/Activity';
import useMapboxToken from 'src/utils/useMapboxToken';

type MapSplitViewProps = {
  activities?: Activity[];
  children: React.ReactNode;
  focusedActivityId?: number;
  projectId: number;
  setFocusedActivityId?: (id: number | undefined) => void;
  topComponent?: React.ReactNode;
};

export default function MapSplitView({
  activities,
  children,
  focusedActivityId,
  projectId,
  setFocusedActivityId,
  topComponent,
}: MapSplitViewProps): JSX.Element {
  const theme = useTheme();
  const { token, mapId } = useMapboxToken();
  const { strings } = useLocalization();

  const onActivityMarkerClick = useCallback(
    (id: number) => () => {
      if (focusedActivityId === id) {
        setFocusedActivityId?.(undefined);
      } else {
        setFocusedActivityId?.(id);
      }
    },
    [focusedActivityId, setFocusedActivityId]
  );

  const { plantingSites } = useProjectPlantingSites(projectId);

  const siteLayer = useMemo((): MapLayer => {
    const features =
      plantingSites?.map(
        (site): MapLayerFeature => ({
          featureId: `${site.id}`,
          label: site.name,
          geometry: {
            type: 'MultiPolygon',
            coordinates: site.boundary?.coordinates ?? [],
          },
        })
      ) ?? [];

    return {
      features,
      label: strings.PLANTING_SITES,
      layerId: 'sites',
      style: {
        borderColor: theme.palette.TwClrBaseGreen300,
        fillColor: theme.palette.TwClrBaseGreen300,
        opacity: 0.2,
        type: 'fill',
      },
    };
  }, [plantingSites, strings, theme]);

  const markerGroups = useMemo((): MapMarkerGroup[] => {
    if (!activities) {
      return [];
    }

    return activities.map((activity): MapMarkerGroup => {
      const markers = activity.media
        .map((media): MapMarker | undefined => {
          if (media.geolocation) {
            return {
              id: `activity-${activity.id}-media-${media.fileId}`,
              longitude: media.geolocation.coordinates[1],
              latitude: media.geolocation.coordinates[0],
              onClick: onActivityMarkerClick(activity.id),
              selected: focusedActivityId === activity.id,
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
      };
    });
  }, [activities, focusedActivityId, onActivityMarkerClick]);

  const mapFeatures = useMemo((): MapFeatureSection[] => {
    return [
      {
        sectionTitle: strings.PHOTOS,
        groups: markerGroups,
        type: 'marker',
      },
      {
        layers: [siteLayer],
        sectionTitle: strings.SITE,
        type: 'layer',
      },
    ];
  }, [markerGroups, siteLayer, strings]);

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      {topComponent}

      <MapComponent
        drawerChildren={children}
        drawerHideHeader
        drawerOpen
        drawerSize='large'
        features={mapFeatures}
        hideLegend
        mapId={mapId}
        token={token ?? ''}
      />
    </Box>
  );
}
