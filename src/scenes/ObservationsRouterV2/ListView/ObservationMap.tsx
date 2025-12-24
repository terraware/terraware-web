import React, { useEffect, useMemo, useRef } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import MapComponent from 'src/components/NewMap';
import { MapLayer, MapNameTag, MapPoint } from 'src/components/NewMap/types';
import useMapFeatureStyles from 'src/components/NewMap/useMapFeatureStyles';
import useMapUtils from 'src/components/NewMap/useMapUtils';
import { getBoundingBoxFromPoints } from 'src/components/NewMap/utils';
import { useLocalization, useOrganization } from 'src/providers';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import useMapboxToken from 'src/utils/useMapboxToken';

type ObservationMapProps = {
  plantingSiteId?: number;
  selectPlantingSiteId: (siteId: number) => void;
};

const ObservationMap = ({ plantingSiteId, selectPlantingSiteId }: ObservationMapProps) => {
  const { strings } = useLocalization();
  const { mapId, token } = useMapboxToken();
  const mapRef = useRef<MapRef | null>(null);
  const { fitBounds } = useMapUtils(mapRef);

  const { selectedOrganization } = useOrganization();
  const { sitesLayerStyle } = useMapFeatureStyles();

  const [listPlantingSites, listPlantingSitesResult] = useLazyListPlantingSitesQuery();

  useEffect(() => {
    if (selectedOrganization && plantingSiteId === undefined) {
      void listPlantingSites({
        organizationId: selectedOrganization.id,
        full: false,
      });
    }
  }, [listPlantingSites, plantingSiteId, selectedOrganization]);

  const allPlantingSites = useMemo(
    () => listPlantingSitesResult?.data?.sites ?? [],
    [listPlantingSitesResult?.data?.sites]
  );

  const layers = useMemo((): MapLayer[] => {
    if (plantingSiteId === undefined) {
      // Show only sites if no layers selected.
      return [
        {
          features: allPlantingSites.map((site) => ({
            featureId: `${site.id}`,
            geometry: {
              type: 'MultiPolygon',
              coordinates: site.boundary?.coordinates ?? [],
            },
          })),
          label: strings.SITE,
          layerId: 'sites',
          style: sitesLayerStyle,
          visible: true,
        },
      ];
    }
    return [];
  }, [allPlantingSites, plantingSiteId, sitesLayerStyle, strings.SITE]);

  const nameTags = useMemo((): MapNameTag[] | undefined => {
    if (plantingSiteId === undefined) {
      return allPlantingSites
        .map((site): MapNameTag | undefined => {
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
              onClick: () => {
                selectPlantingSiteId(site.id);
                fitBounds(bbox);
              },
            };
          }
        })
        .filter((nameTag): nameTag is MapNameTag => nameTag !== undefined);
    }
  }, [allPlantingSites, fitBounds, plantingSiteId, selectPlantingSiteId]);

  return <MapComponent mapLayers={layers} mapId={mapId} mapRef={mapRef} nameTags={nameTags} token={token ?? ''} />;
};

export default ObservationMap;
