import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, Typography, useTheme } from '@mui/material';

import MapComponent from 'src/components/NewMap';
import { MapLegendGroup } from 'src/components/NewMap/MapLegend';
import {
  MapLayer,
  MapLayerFeature,
  MapMarker,
  MapMarkerGroup,
  MapNameTag,
  MapPoint,
} from 'src/components/NewMap/types';
import useMapFeatureStyles from 'src/components/NewMap/useMapFeatureStyles';
import useMapPhotoDrawer from 'src/components/NewMap/useMapPhotoDrawer';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import useNurseriesMapLegend from 'src/components/NewMap/useNurseriesMapLegend';
import usePlantingSiteMapLegend from 'src/components/NewMap/usePlantingSiteMapLegend';
import usePlotPhotosMapLegend from 'src/components/NewMap/usePlotPhotosMapLegend';
import useWithdrawalPhotosForPlantingSite from 'src/components/NewMap/useWithdrawalPhotosForPlantingSite';
import { getBoundingBoxFromPoints } from 'src/components/NewMap/utils';
import { useOrganization } from 'src/providers';
import {
  PlantingSitePayload,
  useLazyGetPlantingSiteQuery,
  useLazyListPlantingSitesQuery,
} from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { getAllNurseries } from 'src/utils/organization';
import useMapboxToken from 'src/utils/useMapboxToken';

import NurseryLocationMapDrawer from './NurseryLocationMapDrawer';
import PlantingProgressMapDrawer from './PlantingProgressMapDrawer';

type SelectedFeature = {
  featureId: string;
  layerId: 'sites' | 'strata' | 'substrata';
  plantingSiteId: number;
};

type PlantingProgressMapProps = {
  plantingSiteId: number | undefined;
};

export default function PlantingProgressMap({ plantingSiteId }: PlantingProgressMapProps): JSX.Element {
  const theme = useTheme();
  const { mapId, refreshToken, token } = useMapboxToken();
  const mapRef = useRef<MapRef | null>(null);
  const { fitBounds } = useMapUtils(mapRef);
  const { selectedOrganization } = useOrganization();

  const { nurseryLayerStyle, sitesLayerStyle, strataLayerStyle, substrataLayerStyle, withdrawalPhotoStyle } =
    useMapFeatureStyles();
  const { selectedLayer, plantingSiteLegendGroup } = usePlantingSiteMapLegend('substrata');

  const { plotPhotosLegendGroup, withdrawalPhotosVisible } = usePlotPhotosMapLegend({
    includeObservations: false,
    includeWithdrawals: true,
    withdrawalsDisabled: plantingSiteId === undefined,
  });

  const { nurseriesLegendGroup, nurseriesVisible } = useNurseriesMapLegend();

  const nurseries = useMemo(
    () => (selectedOrganization ? getAllNurseries(selectedOrganization).filter((nursery) => !!nursery.location) : []),
    [selectedOrganization]
  );

  const { photoDrawerContent, photoDrawerHeader, photoDrawerSize, selectedPhotos, selectPhotos } = useMapPhotoDrawer();

  const [getPlantingSite, getPlantingSiteResponse] = useLazyGetPlantingSiteQuery();
  const singleSite = useMemo(() => getPlantingSiteResponse.currentData?.site, [getPlantingSiteResponse]);

  const [listPlantingSites, listPlantingSitesResponse] = useLazyListPlantingSitesQuery();
  const allOrgSites = useMemo(
    () => listPlantingSitesResponse.currentData?.sites ?? [],
    [listPlantingSitesResponse.currentData?.sites]
  );

  useEffect(() => {
    if (plantingSiteId !== undefined) {
      void getPlantingSite({ id: plantingSiteId }, true);
    } else if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id, full: true, includeZones: false }, true);
    }
  }, [getPlantingSite, listPlantingSites, plantingSiteId, selectedOrganization]);

  const sites = useMemo((): PlantingSitePayload[] => {
    if (plantingSiteId === undefined) {
      return allOrgSites.filter((site) => !!site.boundary);
    }
    if (singleSite?.boundary && singleSite.id === plantingSiteId) {
      return [singleSite];
    }
    return [];
  }, [allOrgSites, plantingSiteId, singleSite]);

  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | undefined>();
  const [selectedNurseryId, setSelectedNurseryId] = useState<number | undefined>();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const withdrawalPhotos = useWithdrawalPhotosForPlantingSite({
    enabled: withdrawalPhotosVisible,
    plantingSiteId,
  });

  useEffect(() => {
    setSelectedFeature(undefined);
    setSelectedNurseryId(undefined);
    setDrawerOpen(false);
    selectPhotos([]);
  }, [plantingSiteId, selectPhotos]);

  const selectFeature = useCallback(
    (siteId: number, layerId: 'sites' | 'strata' | 'substrata', featureId: string) => () => {
      setSelectedFeature({ layerId, featureId, plantingSiteId: siteId });
      setSelectedNurseryId(undefined);
      selectPhotos([]);
      setDrawerOpen(true);
    },
    [selectPhotos]
  );

  const selectNursery = useCallback(
    (nurseryId: number) => () => {
      setSelectedNurseryId(nurseryId);
      setSelectedFeature(undefined);
      selectPhotos([]);
      setDrawerOpen(true);
    },
    [selectPhotos]
  );

  const setDrawerOpenCallback = useCallback(
    (open: boolean) => {
      if (open) {
        setDrawerOpen(true);
      } else {
        setDrawerOpen(false);
        setSelectedFeature(undefined);
        setSelectedNurseryId(undefined);
        selectPhotos([]);
      }
    },
    [selectPhotos]
  );

  const extractFeaturesFromSite = useCallback(
    (
      site: PlantingSitePayload
    ): {
      siteFeatures: MapLayerFeature[];
      stratumFeatures: MapLayerFeature[];
      substratumFeatures: MapLayerFeature[];
    } => {
      const strata = site.strata ?? [];
      const substrata = strata.flatMap((stratum) => stratum.substrata ?? []);
      const isSelected = (layerId: string, featureId: string) =>
        selectedFeature?.layerId === layerId &&
        selectedFeature?.featureId === featureId &&
        selectedFeature?.plantingSiteId === site.id;

      return {
        siteFeatures: site.boundary
          ? [
              {
                featureId: `${site.id}`,
                geometry: {
                  type: 'MultiPolygon',
                  coordinates: site.boundary.coordinates,
                },
                onClick: selectFeature(site.id, 'sites', `${site.id}`),
                selected: isSelected('sites', `${site.id}`),
              },
            ]
          : [],
        stratumFeatures: strata.map((stratum) => ({
          featureId: `${stratum.id}`,
          label: stratum.name,
          geometry: {
            type: 'MultiPolygon',
            coordinates: stratum.boundary.coordinates,
          },
          onClick: selectFeature(site.id, 'strata', `${stratum.id}`),
          selected: isSelected('strata', `${stratum.id}`),
        })),
        substratumFeatures: substrata.map((substratum) => ({
          featureId: `${substratum.id}`,
          label: substratum.name,
          geometry: {
            type: 'MultiPolygon',
            coordinates: substratum.boundary.coordinates,
          },
          onClick: selectFeature(site.id, 'substrata', `${substratum.id}`),
          selected: isSelected('substrata', `${substratum.id}`),
        })),
      };
    },
    [selectFeature, selectedFeature]
  );

  const layers = useMemo((): MapLayer[] => {
    const features = sites.map((site) => extractFeaturesFromSite(site));

    return [
      {
        features: features.flatMap(({ siteFeatures }) => siteFeatures),
        layerId: 'sites',
        style: sitesLayerStyle,
        visible: selectedLayer === 'sites',
      },
      {
        features: features.flatMap(({ stratumFeatures }) => stratumFeatures),
        layerId: 'strata',
        style: strataLayerStyle,
        visible: selectedLayer === 'strata',
      },
      {
        features: features.flatMap(({ substratumFeatures }) => substratumFeatures),
        layerId: 'substrata',
        style: substrataLayerStyle,
        visible: selectedLayer === 'substrata',
      },
    ];
  }, [sites, extractFeaturesFromSite, sitesLayerStyle, selectedLayer, strataLayerStyle, substrataLayerStyle]);

  const nameTags = useMemo((): MapNameTag[] => {
    return sites.flatMap((site): MapNameTag[] => {
      if (!site.boundary) {
        return [];
      }
      const points = site.boundary.coordinates
        .flat()
        .flat()
        .map(([lng, lat]): MapPoint => ({ lat, lng }));
      const bbox = getBoundingBoxFromPoints(points);
      return [
        {
          label: site.name,
          longitude: (bbox.maxLng + bbox.minLng) / 2,
          latitude: (bbox.maxLat + bbox.minLat) / 2,
          onClick: () => fitBounds(bbox),
        },
      ];
    });
  }, [sites, fitBounds]);

  useEffect(() => {
    const points = sites
      .flatMap((site) => site.boundary?.coordinates ?? [])
      .flat()
      .flat()
      .map(([lng, lat]): MapPoint => ({ lat, lng }));

    if (points.length) {
      const bbox = getBoundingBoxFromPoints(points);
      fitBounds(bbox);
    }
  }, [fitBounds, sites]);

  const legends = useMemo(
    (): MapLegendGroup[] => [plantingSiteLegendGroup, plotPhotosLegendGroup, nurseriesLegendGroup],
    [nurseriesLegendGroup, plantingSiteLegendGroup, plotPhotosLegendGroup]
  );

  const withdrawalPhotoMarkers = useMemo(
    (): MapMarker[] =>
      withdrawalPhotos.map((entry) => ({
        id: `withdrawal-photo/${entry.withdrawalId}/${entry.photoId}`,
        longitude: entry.gpsCoordinates.coordinates[0],
        latitude: entry.gpsCoordinates.coordinates[1],
        onClick: () => {
          setSelectedFeature(undefined);
          setSelectedNurseryId(undefined);
          selectPhotos([
            {
              kind: 'withdrawal-photo',
              capturedLocalTime: entry.capturedLocalTime,
              withdrawalId: entry.withdrawalId,
              photoId: entry.photoId,
              withdrawnDate: entry.withdrawnDate,
              gpsCoordinates: entry.gpsCoordinates,
            },
          ]);
          setDrawerOpen(true);
        },
        selected: selectedPhotos.some(
          (p) => p.kind === 'withdrawal-photo' && p.photoId === entry.photoId && p.withdrawalId === entry.withdrawalId
        ),
      })),
    [selectPhotos, selectedPhotos, withdrawalPhotos]
  );

  const nurseryMarkers = useMemo(
    (): MapMarker[] =>
      nurseries.flatMap((nursery) => {
        const coordinates = nursery.location?.coordinates;
        if (!coordinates) {
          return [];
        }
        return [
          {
            id: `nursery/${nursery.id}`,
            longitude: coordinates[0],
            latitude: coordinates[1],
            onClick: selectNursery(nursery.id),
            selected: selectedNurseryId === nursery.id,
          },
        ];
      }),
    [nurseries, selectNursery, selectedNurseryId]
  );

  const mapMarkers = useMemo(
    (): MapMarkerGroup[] => [
      {
        markerGroupId: 'withdrawal-photos',
        markers: withdrawalPhotoMarkers,
        style: withdrawalPhotoStyle,
        visible: withdrawalPhotosVisible,
      },
      {
        markerGroupId: 'nurseries',
        markers: nurseryMarkers,
        style: nurseryLayerStyle,
        visible: nurseriesVisible,
      },
    ],
    [
      nurseryLayerStyle,
      nurseryMarkers,
      nurseriesVisible,
      withdrawalPhotoMarkers,
      withdrawalPhotoStyle,
      withdrawalPhotosVisible,
    ]
  );

  const selectedNursery = useMemo(
    () => nurseries.find((nursery) => nursery.id === selectedNurseryId),
    [nurseries, selectedNurseryId]
  );

  const drawerContent = useMemo(() => {
    if (selectedPhotos.length > 0) {
      return photoDrawerContent;
    }
    if (selectedNursery) {
      return <NurseryLocationMapDrawer nurseryId={selectedNursery.id} nurseryName={selectedNursery.name} />;
    }
    if (!selectedFeature) {
      return undefined;
    }
    return (
      <PlantingProgressMapDrawer
        layerId={selectedFeature.layerId}
        featureId={selectedFeature.featureId}
        plantingSiteId={selectedFeature.plantingSiteId}
      />
    );
  }, [photoDrawerContent, selectedFeature, selectedNursery, selectedPhotos.length]);

  const drawerSize = selectedPhotos.length > 0 ? photoDrawerSize : 'small';

  if (!sites.length) {
    return (
      <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxt} textAlign='center'>
        {strings.NO_MAP_DATA}
      </Typography>
    );
  }

  return token ? (
    <MapComponent
      drawerChildren={drawerContent}
      drawerHeader={selectedPhotos.length > 0 ? photoDrawerHeader : undefined}
      drawerOpen={drawerOpen}
      drawerSize={drawerSize}
      legends={legends}
      mapId={mapId}
      mapLayers={layers}
      mapMarkers={mapMarkers}
      mapRef={mapRef}
      nameTags={nameTags}
      onTokenExpired={refreshToken}
      setDrawerOpen={setDrawerOpenCallback}
      token={token}
    />
  ) : (
    <Box />
  );
}
