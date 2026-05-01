import React, { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, Typography, useTheme } from '@mui/material';

import MapComponent from 'src/components/NewMap';
import { MapLegendGroup } from 'src/components/NewMap/MapLegend';
import { MapLayer, MapLayerFeature, MapNameTag, MapPoint } from 'src/components/NewMap/types';
import useMapFeatureStyles from 'src/components/NewMap/useMapFeatureStyles';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import usePlantingSiteMapLegend from 'src/components/NewMap/usePlantingSiteMapLegend';
import { getBoundingBoxFromPoints } from 'src/components/NewMap/utils';
import { useOrganization } from 'src/providers';
import {
  PlantingSitePayload,
  useLazyGetPlantingSiteQuery,
  useLazyListPlantingSitesQuery,
} from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import useMapboxToken from 'src/utils/useMapboxToken';

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

  const { sitesLayerStyle, strataLayerStyle, substrataLayerStyle } = useMapFeatureStyles();
  const { selectedLayer, plantingSiteLegendGroup } = usePlantingSiteMapLegend('substrata');

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
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedFeature(undefined);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen(false);
  }, [plantingSiteId]);

  const selectFeature = useCallback(
    (siteId: number, layerId: 'sites' | 'strata' | 'substrata', featureId: string) => () => {
      setSelectedFeature({ layerId, featureId, plantingSiteId: siteId });
      setDrawerOpen(true);
    },
    []
  );

  const setDrawerOpenCallback = useCallback((open: boolean) => {
    if (open) {
      setDrawerOpen(true);
    } else {
      setDrawerOpen(false);
      setSelectedFeature(undefined);
    }
  }, []);

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

  const legends = useMemo((): MapLegendGroup[] => [plantingSiteLegendGroup], [plantingSiteLegendGroup]);

  const drawerContent = useMemo(() => {
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
  }, [selectedFeature, setDrawerOpenCallback]);

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
      drawerOpen={drawerOpen}
      drawerSize='small'
      legends={legends}
      mapId={mapId}
      mapLayers={layers}
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
