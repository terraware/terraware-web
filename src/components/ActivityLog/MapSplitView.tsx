import React, { useCallback, useMemo } from 'react';

import { Box } from '@mui/material';

import MapComponent, { MapFeatureSection } from 'src/components/NewMap';
import { MapMarker, MapMarkerGroup } from 'src/components/NewMap/types';
import { Activity, activityTypeColor } from 'src/types/Activity';
import useMapboxToken from 'src/utils/useMapboxToken';

type MapSplitViewProps = {
  activities?: Activity[];
  children: React.ReactNode;
  focusedActivityId?: number;
  setFocusedActivityId?: (id: number | undefined) => void;
  topComponent?: React.ReactNode;
};

export default function MapSplitView({
  activities,
  children,
  focusedActivityId,
  setFocusedActivityId,
  topComponent,
}: MapSplitViewProps): JSX.Element {
  const { token, mapId } = useMapboxToken();

  const onActivityMarkerClick = useCallback((id: number) => () => {
    if (focusedActivityId === id) {
      setFocusedActivityId?.(undefined);
    } else {
      setFocusedActivityId?.(id);
    }
  }, [focusedActivityId, setFocusedActivityId]);

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
        }, [])
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
        sectionTitle: '',
        groups: markerGroups,
        type: 'marker',
      },
    ];
  }, [markerGroups]);

  return (
    <Box display='flex' flexDirection='column' flexGrow={1}>
      {topComponent}

      <MapComponent
        drawerChildren={children}
        drawerHideHeader
        drawerOpen
        drawerSize='large'
        features={mapFeatures}
        mapId={mapId}
        token={token ?? ''}
      />
    </Box>
  );
}
