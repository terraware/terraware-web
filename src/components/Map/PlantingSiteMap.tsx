import React, { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, useTheme } from '@mui/material';
import { getMapboxToken } from 'src/api/tracking/tracking';
import { Geometry, PlantingSite } from 'src/api/types/tracking';
import useSnackbar from 'src/utils/useSnackbar';
import Map from './Map';
import { MapGeometry, MapOptions, MapSource } from './MapModels';
import { getBoundingBox } from './MapUtils';

export type PlantingSiteMapProps = {
  plantingSite: PlantingSite;
};

export default function PlantingSiteMap(props: PlantingSiteMapProps): JSX.Element {
  const { plantingSite } = props;
  const theme = useTheme();
  const [snackbar] = useState(useSnackbar());
  const [token, setToken] = useState<string>();
  const [mapOptions, setMapOptions] = useState<MapOptions>();

  const getFillColor = useCallback(() => {
    return theme.palette.TwClrBaseWhite || 'white';
  }, [theme.palette.TwClrBaseWhite]);

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
        fillColor: getFillColor(),
        fillOpacity: 0.1,
      };
    },
    [getPolygons, getFillColor]
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
          fillColor: getFillColor(),
          fillOpacity: 0.2,
        };
      });
    },
    [getPolygons, getFillColor]
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
            fillColor: getFillColor(),
            fillOpacity: 0.3,
            onClick: () => `
            ID ${id}
            Name ${fullName || name}
          `,
          };
        });
      });
    },
    [getPolygons, getFillColor]
  );

  // fetch token
  const fetchMapboxToken = useCallback(async () => {
    const response = await getMapboxToken();
    if (response.requestSucceeded) {
      setToken(response.token);
    } else {
      snackbar.toastError(response.error);
    }
  }, [snackbar]);

  useEffect(() => {
    if (token) {
      return;
    }
    fetchMapboxToken();
  });

  // fetch polygons and boundaries
  useEffect(() => {
    const fetchPlantingSite = () => {
      const site = extractPlantingSite(plantingSite);
      const zones = extractPlantingZones(plantingSite) || [];
      const plots = extractPlots(plantingSite) || [];

      const geometries: MapGeometry[] = [
        site?.boundary,
        ...zones.map((s) => s.boundary),
        ...plots.map((s) => s.boundary),
      ].filter((g) => g) as MapGeometry[];

      setMapOptions({
        bbox: getBoundingBox(geometries),
        sources: [site, ...zones, ...plots],
      });
    };

    fetchPlantingSite();
  }, [plantingSite, snackbar, extractPlantingSite, extractPlantingZones, extractPlots]);

  if (!token || !mapOptions) {
    return (
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <CircularProgress sx={{ margin: 'auto auto' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Map token={token} options={mapOptions} onTokenExpired={fetchMapboxToken} />
    </Box>
  );
}
