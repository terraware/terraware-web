import React, { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, useTheme } from '@mui/material';
import { getMapboxToken } from 'src/api/tracking/tracking';
import { Geometry, PlantingSite } from 'src/api/types/tracking';
import useSnackbar from 'src/utils/useSnackbar';
import Map from './Map';
import { MapGeometry, MapOptions, MapPopupRenderer, MapSource } from './MapModels';
import { getBoundingBox } from './MapUtils';
import _ from 'lodash';
import { useDefaultPopupRenderer } from './MapRenderUtils';

export type PlantingSiteMapProps = {
  plantingSite: PlantingSite;
};

export default function PlantingSiteMap(props: PlantingSiteMapProps): JSX.Element {
  const { plantingSite } = props;
  const theme = useTheme();
  const [snackbar] = useState(useSnackbar());
  const [token, setToken] = useState<string>();
  const [mapOptions, setMapOptions] = useState<MapOptions>();
  const [mapId, setMapId] = useState<string>();
  const popupRenderer: MapPopupRenderer = useDefaultPopupRenderer();

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
        properties: { id, name, description, type: 'site' },
        boundary: getPolygons(boundary),
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
          properties: { id, name, type: 'zone' },
          boundary: getPolygons(boundary),
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
            properties: { id, name, fullName, type: 'plot' },
            boundary: getPolygons(boundary),
            id: `plot-${id}`,
            fillColor: getFillColor(),
            fillOpacity: 0.3,
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
      setMapId(Date.now.toString());
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

      const newMapOptions = {
        bbox: getBoundingBox(geometries),
        sources: [site, ...zones, ...plots],
      };

      if (!_.isEqual(newMapOptions, mapOptions)) {
        setMapOptions(newMapOptions);
      }
    };

    fetchPlantingSite();
  }, [plantingSite, snackbar, extractPlantingSite, extractPlantingZones, extractPlots, mapOptions]);

  if (!token || !mapOptions) {
    return (
      <Box sx={{ display: 'flex', flexGrow: 1, height: '100%' }}>
        <CircularProgress sx={{ margin: 'auto auto' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexGrow: 1 }}>
      <Map
        token={token}
        options={mapOptions}
        onTokenExpired={fetchMapboxToken}
        mapId={mapId}
        popupRenderer={popupRenderer}
      />
    </Box>
  );
}
