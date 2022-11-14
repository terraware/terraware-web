import React, { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { getMapboxToken, getPlantingSite } from 'src/api/tracking/tracking';
import { Geometry, PlantingSite } from 'src/api/types/tracking';
import useSnackbar from 'src/utils/useSnackbar';
import Map from './Map';
import { MapGeometry, MapOptions, MapSource } from './MapModels';
import { getBoundingBox } from './MapUtils';

export type PlantingSiteMapProps = {
  siteId: number;
};

export default function PlantingSiteMap(props: PlantingSiteMapProps): JSX.Element {
  const { siteId } = props;
  const [snackbar] = useState(useSnackbar());
  const [token, setToken] = useState<string>();
  const [mapOptions, setMapOptions] = useState<MapOptions>();

  const getPolygons = useCallback((boundary?: Geometry): MapGeometry => {
    if (!boundary) {
      return [];
    }
    return boundary.coordinates;
  }, []);

  const extractPlantingSite = useCallback(
    (site: PlantingSite): MapSource => {
      const { id, name, description, boundary } = site;
      return {
        metadata: { id, name, description },
        boundary: getPolygons(boundary),
        name: `site-${name}`,
        id: `site-${id}`,
        fillColor: 'yellow',
        fillOpacity: 0.5,
      };
    },
    [getPolygons]
  );

  const extractPlantingZones = useCallback(
    (site: PlantingSite): MapSource[] | undefined => {
      return site.plantingZones?.map((zone) => {
        const { id, name, boundary } = zone;
        return {
          metadata: { id, name },
          boundary: getPolygons(boundary),
          name: `zone-${name}`,
          id: `zone-${id}`,
          fillColor: 'blue',
          fillOpacity: 0.5,
        };
      });
    },
    [getPolygons]
  );

  const extractPlots = useCallback(
    (site: PlantingSite): MapSource[] | undefined => {
      return site.plantingZones?.flatMap((zone) => {
        const { plots } = zone;
        return plots.map((plot) => {
          const { id, name, fullName, boundary } = plot;
          return {
            metadata: { id, name, fullName },
            boundary: getPolygons(boundary),
            name: `plot-${name}`,
            id: `plot-${id}`,
            fillColor: 'green',
            fillOpacity: 0.5,
            onClick: () => `
            ID ${id}
            Name ${fullName || name}
          `,
          };
        });
      });
    },
    [getPolygons]
  );

  // fetch token
  useEffect(() => {
    // TODO: set timeout to refresh the token
    const fetchToken = async () => {
      if (token) {
        return;
      }
      const response = await getMapboxToken();
      if (response.requestSucceeded) {
        setToken(response.token);
      } else {
        snackbar.toastError(response.error);
      }
    };

    fetchToken();
  });

  // fetch polygons and boundaries
  useEffect(() => {
    const fetchPlantingSite = async () => {
      const response = await getPlantingSite(siteId);
      if (response.requestSucceeded && response.site) {
        const site = extractPlantingSite(response.site);
        const zones = extractPlantingZones(response.site) || [];
        const plots = extractPlots(response.site) || [];

        const geometries: MapGeometry[] = [
          site?.boundary,
          ...zones.map((s) => s.boundary),
          ...plots.map((s) => s.boundary),
        ].filter((g) => g) as MapGeometry[];

        setMapOptions({
          bbox: getBoundingBox(geometries),
          sources: [site, ...zones, ...plots],
        });
      } else {
        setMapOptions(undefined);
        snackbar.toastError(response.error);
      }
    };

    fetchPlantingSite();
  }, [siteId, snackbar, extractPlantingSite, extractPlantingZones, extractPlots]);

  if (!token || !mapOptions) {
    return (
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <CircularProgress sx={{ margin: 'auto auto' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Map token={token} options={mapOptions} />
    </Box>
  );
}
