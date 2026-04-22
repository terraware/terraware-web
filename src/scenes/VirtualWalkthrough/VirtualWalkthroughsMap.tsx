import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box } from '@mui/material';

import MapComponent from 'src/components/NewMap';
import { MapLegendGroup } from 'src/components/NewMap/MapLegend';
import { MapLayer, MapMarker, MapMarkerGroup, MapNameTag, MapPoint } from 'src/components/NewMap/types';
import useMapFeatureStyles from 'src/components/NewMap/useMapFeatureStyles';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import usePlantingSiteMapLegend from 'src/components/NewMap/usePlantingSiteMapLegend';
import { getBoundingBoxFromPoints } from 'src/components/NewMap/utils';
import Button from 'src/components/common/button/Button';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { useLocalization } from 'src/providers';
import { OrganizationVirtualWalkthrough } from 'src/queries/search/virtualWalkthroughs';
import useMapboxToken from 'src/utils/useMapboxToken';

import VirtualWalkthroughModal from './VirtualWalkthroughModal';

type VirtualWalkthroughsMapProps = {
  mediaFiles: OrganizationVirtualWalkthrough[];
  organizationId: number;
};

export default function VirtualWalkthroughsMap({
  mediaFiles,
  organizationId,
}: VirtualWalkthroughsMapProps): JSX.Element {
  const mapRef = useRef<MapRef | null>(null);
  const { mapId, token } = useMapboxToken();
  const { fitBounds } = useMapUtils(mapRef);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<OrganizationVirtualWalkthrough | undefined>(undefined);

  const { plantingSites } = useOrganizationPlantingSites({ full: true });
  const { strings } = useLocalization();

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
      setSelectedFile(file);
      setDrawerOpen(true);
    },
    []
  );

  const virtualWalkthroughMarkers = useMemo((): MapMarker[] => {
    return mediaFiles
      .filter((f) => f.splatStatus === 'Ready' && f.latitude !== undefined && f.longitude !== undefined)
      .map(
        (f): MapMarker => ({
          id: `splats/${f.fileId}`,
          latitude: f.latitude!,
          longitude: f.longitude!,
          selected: selectedFile?.fileId === f.fileId,
          onClick: selectFile(f),
        })
      );
  }, [mediaFiles, selectFile, selectedFile]);

  const markers = useMemo((): MapMarkerGroup[] => {
    return [
      {
        markers: virtualWalkthroughMarkers,
        markerGroupId: 'virtual-walkthroughs',
        style: virtualPlotStyle,
        visible: virtualWalkthroughsVisible,
      },
    ];
  }, [virtualPlotStyle, virtualWalkthroughMarkers, virtualWalkthroughsVisible]);

  const drawerContent = useMemo(() => {
    if (!selectedFile) {
      return undefined;
    }
    return (
      <Box display='flex' flexDirection='column' width='100%' gap={2}>
        {selectedFile.type !== 'Plot' && (
          <Box
            component='img'
            src={`/api/v1/organizations/${organizationId}/media/${selectedFile.fileId}/thumbnail?maxWidth=377`}
            alt={strings.THUMBNAIL}
            sx={{ width: '100%', objectFit: 'cover' }}
          />
        )}

        <Button
          id='view-3d-model'
          label={strings.VIEW_3D_MODEL}
          onClick={() => setModalOpen(true)}
          priority='primary'
          size='medium'
          disabled={selectedFile.splatStatus !== 'Ready'}
        />
      </Box>
    );
  }, [organizationId, selectedFile, strings]);

  return (
    <>
      {modalOpen &&
        selectedFile &&
        (selectedFile.type === 'Plot' && selectedFile.observationId ? (
          <VirtualWalkthroughModal
            observationId={selectedFile.observationId}
            fileId={selectedFile.fileId}
            onClose={() => setModalOpen(false)}
          />
        ) : (
          <VirtualWalkthroughModal
            organizationId={organizationId}
            fileId={selectedFile.fileId}
            onClose={() => setModalOpen(false)}
          />
        ))}
      <MapComponent
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
        drawerChildren={drawerContent}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  );
}
