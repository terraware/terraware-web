import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef, Marker } from 'react-map-gl/mapbox';
import { useSearchParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';

import MapComponent from 'src/components/NewMap';
import MapDrawerPagination from 'src/components/NewMap/MapDrawerPagination';
import { MapLegendGroup } from 'src/components/NewMap/MapLegend';
import { MapLayer, MapMarker, MapMarkerGroup, MapNameTag, MapPoint } from 'src/components/NewMap/types';
import useMapFeatureStyles from 'src/components/NewMap/useMapFeatureStyles';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import usePlantingSiteMapLegend from 'src/components/NewMap/usePlantingSiteMapLegend';
import { getBoundingBoxFromPoints } from 'src/components/NewMap/utils';
import Button from 'src/components/common/button/Button';
import { API_PATHS } from 'src/constants';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { useLocalization } from 'src/providers';
import { useUpdateOrganizationMediaFileMutation } from 'src/queries/generated/organizationMedia';
import { OrganizationVirtualWalkthrough } from 'src/queries/search/virtualWalkthroughs';
import useMapboxToken from 'src/utils/useMapboxToken';

type VirtualWalkthroughsMapProps = {
  mediaFiles: OrganizationVirtualWalkthrough[];
  onPlacementComplete: () => void;
  organizationId: number;
  pendingPlacementFile: OrganizationVirtualWalkthrough | undefined;
};

export default function VirtualWalkthroughsMap({
  mediaFiles,
  onPlacementComplete,
  organizationId,
  pendingPlacementFile,
}: VirtualWalkthroughsMapProps): JSX.Element {
  const theme = useTheme();
  const mapRef = useRef<MapRef | null>(null);
  const { mapId, token } = useMapboxToken();
  const { fitBounds } = useMapUtils(mapRef);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [, setSearchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<OrganizationVirtualWalkthrough[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const selectedFile = selectedFiles[selectedFileIndex];

  const { plantingSites } = useOrganizationPlantingSites({ full: true });
  const { strings } = useLocalization();
  const [updateMedia] = useUpdateOrganizationMediaFileMutation();

  const { selectedLayer, plantingSiteLegendGroup } = usePlantingSiteMapLegend('sites');
  const { sitesLayerStyle, strataLayerStyle, substrataLayerStyle, virtualPlotStyle } = useMapFeatureStyles();
  const [virtualWalkthroughsVisible, setVirtualWalkthroughsVisible] = useState(true);

  useEffect(() => {
    if (mapLoaded && plantingSites.length) {
      const points = plantingSites.flatMap(
        (site) =>
          site.boundary?.coordinates
            ?.flat()
            ?.flat()
            ?.map(([lng, lat]): MapPoint => ({ lat, lng })) ?? []
      );
      if (points.length) {
        fitBounds(getBoundingBoxFromPoints(points));
      }
    }
  }, [fitBounds, mapLoaded, plantingSites]);

  useEffect(() => {
    if (pendingPlacementFile?.latitude !== undefined && pendingPlacementFile?.longitude !== undefined) {
      mapRef.current?.flyTo({
        center: [pendingPlacementFile.longitude, pendingPlacementFile.latitude],
        zoom: 10,
      });
    }
  }, [pendingPlacementFile]);

  const pendingMarkerPos = useMemo(() => {
    if (!pendingPlacementFile) {
      return undefined;
    }
    if (pendingPlacementFile.latitude !== undefined && pendingPlacementFile.longitude !== undefined) {
      return { lat: pendingPlacementFile.latitude, lng: pendingPlacementFile.longitude };
    }
    const points = plantingSites.flatMap(
      (site) =>
        site.boundary?.coordinates
          ?.flat()
          ?.flat()
          ?.map(([lng, lat]): MapPoint => ({ lat, lng })) ?? []
    );
    if (points.length) {
      const bbox = getBoundingBoxFromPoints(points);
      return { lat: (bbox.minLat + bbox.maxLat) / 2, lng: (bbox.minLng + bbox.maxLng) / 2 };
    }
    return { lat: 0, lng: 0 };
  }, [pendingPlacementFile, plantingSites]);

  const handleMarkerDragEnd = useCallback(
    (e: { lngLat: { lat: number; lng: number } }) => {
      if (!pendingPlacementFile) {
        return;
      }
      void updateMedia({
        organizationId,
        fileId: pendingPlacementFile.fileId,
        updateOrganizationMediaRequestPayload: {
          gpsCoordinates: { type: 'Point', coordinates: [e.lngLat.lng, e.lngLat.lat] },
        },
      });
      onPlacementComplete();
    },
    [onPlacementComplete, organizationId, pendingPlacementFile, updateMedia]
  );

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
    return [
      plantingSiteLegendGroup,
      {
        items: [
          {
            id: 'virtual-walkthroughs',
            label: strings.VIRTUAL_WALKTHROUGHS,
            setVisible: setVirtualWalkthroughsVisible,
            style: virtualPlotStyle,
            visible: virtualWalkthroughsVisible,
          },
        ],
        title: strings.PHOTOS_VIDEOS,
        type: 'multi-select',
      },
    ];
  }, [plantingSiteLegendGroup, virtualPlotStyle, virtualWalkthroughsVisible, strings]);

  const selectFile = useCallback(
    (file: OrganizationVirtualWalkthrough) => () => {
      setSelectedFiles([file]);
      setSelectedFileIndex(0);
      setDrawerOpen(true);
    },
    []
  );

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setDrawerOpen(open);
    if (!open) {
      setSelectedFiles([]);
      setSelectedFileIndex(0);
    }
  }, []);

  const handleClusterClick = useCallback((clusteredMarkers: MapMarker[]) => {
    const files = clusteredMarkers
      .map((m) => m.properties?.file as OrganizationVirtualWalkthrough | undefined)
      .filter((f): f is OrganizationVirtualWalkthrough => f !== undefined);
    if (files.length > 0) {
      setSelectedFiles(files);
      setSelectedFileIndex(0);
      setDrawerOpen(true);
    }
  }, []);

  const monitoringPlotBoundaries = useMemo(() => {
    const map = new Map<number, number[][]>();
    plantingSites.forEach((site) => {
      site.adHocPlots?.forEach((plot) => {
        if (plot.boundary?.coordinates?.length) {
          map.set(plot.id, plot.boundary.coordinates[0]);
        }
      });
      site.strata?.forEach((stratum) => {
        stratum.substrata?.forEach((substratum) => {
          substratum.monitoringPlots?.forEach((plot) => {
            if (plot.boundary?.coordinates?.length) {
              map.set(plot.id, plot.boundary.coordinates[0]);
            }
          });
        });
      });
    });
    return map;
  }, [plantingSites]);

  const virtualWalkthroughMarkers = useMemo((): MapMarker[] => {
    return mediaFiles
      .filter((f) => (f.splatStatus === 'Ready' || f.splatStatus === 'Preparing') && !f.needsAttention)
      .map((f): MapMarker | undefined => {
        let latitude: number;
        let longitude: number;

        if (f.latitude !== undefined && f.longitude !== undefined) {
          latitude = f.latitude;
          longitude = f.longitude;
        } else if (f.type === 'Plot' && f.monitoringPlotId !== undefined) {
          const coords = monitoringPlotBoundaries.get(f.monitoringPlotId);
          if (!coords) {
            return undefined;
          }
          const points = coords.map(([lng, lat]): MapPoint => ({ lat, lng }));
          const bbox = getBoundingBoxFromPoints(points);
          latitude = (bbox.maxLat + bbox.minLat) / 2;
          longitude = (bbox.maxLng + bbox.minLng) / 2;
        } else {
          return undefined;
        }

        return {
          id: `splats/${f.fileId}`,
          latitude,
          longitude,
          selected: selectedFile?.fileId === f.fileId,
          onClick: selectFile(f),
          properties: { file: f },
        };
      })
      .filter((marker): marker is MapMarker => marker !== undefined);
  }, [mediaFiles, monitoringPlotBoundaries, selectFile, selectedFile]);

  const markers = useMemo((): MapMarkerGroup[] => {
    return [
      {
        markers: virtualWalkthroughMarkers,
        markerGroupId: 'virtual-walkthroughs',
        style: virtualPlotStyle,
        visible: virtualWalkthroughsVisible,
        onClusterClick: handleClusterClick,
      },
    ];
  }, [handleClusterClick, virtualPlotStyle, virtualWalkthroughMarkers, virtualWalkthroughsVisible]);

  const drawerHeader = useMemo(() => {
    if (selectedFiles.length <= 1) {
      return undefined;
    }
    return (
      <MapDrawerPagination
        drawerSize='medium'
        page={selectedFileIndex + 1}
        setPage={(page) => setSelectedFileIndex(page - 1)}
        totalPages={selectedFiles.length}
      />
    );
  }, [selectedFileIndex, selectedFiles.length]);

  const drawerContent = useMemo(() => {
    if (!selectedFile) {
      return undefined;
    }
    const isPreparing = selectedFile.splatStatus === 'Preparing';
    const thumbnailSrc =
      selectedFile.type === 'Plot'
        ? selectedFile.observationId && selectedFile.monitoringPlotId
          ? `${API_PATHS.OBSERVATION_PLOT_PHOTO.replace('{observationId}', String(selectedFile.observationId))
              .replace('{monitoringPlotId}', String(selectedFile.monitoringPlotId))
              .replace('{fileId}', String(selectedFile.fileId))}?maxWidth=377`
          : undefined
        : `${API_PATHS.ORGANIZATION_MEDIA_THUMBNAIL.replace('{organizationId}', String(organizationId)).replace('{fileId}', String(selectedFile.fileId))}?maxWidth=377`;
    return (
      <Box display='flex' flexDirection='column' width='100%' gap={2}>
        {thumbnailSrc && (
          <Box sx={{ position: 'relative', width: '100%' }}>
            <Box
              component='img'
              src={thumbnailSrc}
              alt={strings.THUMBNAIL}
              sx={{ aspectRatio: '3 / 2', display: 'block', objectFit: 'cover', width: '100%', borderRadius: '8px' }}
            />
            {!isPreparing && (
              <Box
                component='img'
                src='/assets/360icon.svg'
                alt=''
                sx={{
                  height: '49px',
                  left: '50%',
                  position: 'absolute',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '49px',
                }}
              />
            )}
            {isPreparing && (
              <Box
                sx={{
                  alignItems: 'center',
                  backdropFilter: 'blur(4px)',
                  backgroundColor: 'rgba(211, 211, 211, 0.75)',
                  bottom: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  left: 0,
                  position: 'absolute',
                  right: 0,
                  top: 0,
                }}
              >
                <Typography color={theme.palette.TwClrBaseBlack} fontSize='14px' fontWeight={400}>
                  {strings.PROCESSING_VIDEO}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <Button
          id='view-3d-model'
          label={strings.VIEW_3D_MODEL}
          onClick={() =>
            setSearchParams((prev) => {
              const p = new URLSearchParams(prev);
              p.set('virtualWalkthrough', selectedFile.fileId.toString());
              return p;
            })
          }
          priority='primary'
          size='medium'
          disabled={selectedFile.splatStatus !== 'Ready'}
        />
      </Box>
    );
  }, [organizationId, selectedFile, setSearchParams, strings, theme]);

  const draggableMarker =
    pendingPlacementFile && pendingMarkerPos ? (
      <Marker
        latitude={pendingMarkerPos.lat}
        longitude={pendingMarkerPos.lng}
        draggable
        anchor='bottom'
        onDragEnd={handleMarkerDragEnd}
        style={{ cursor: 'grab' }}
      >
        <Box component='img' src='/assets/map-marker.svg' sx={{ width: 32, height: 32 }} />
      </Marker>
    ) : null;

  return (
    <>
      <MapComponent
        clusterMaxZoom={20}
        mapId={mapId}
        mapRef={mapRef}
        token={token ?? ''}
        mapLayers={layers}
        mapMarkers={mapLoaded ? markers : undefined}
        nameTags={nameTags}
        legends={legends}
        onMapLoad={() => setMapLoaded(true)}
        drawerOpen={drawerOpen}
        drawerSize='medium'
        drawerHeader={drawerHeader}
        drawerChildren={drawerContent}
        setDrawerOpen={handleDrawerOpenChange}
        additionalComponent={draggableMarker}
      />
    </>
  );
}
