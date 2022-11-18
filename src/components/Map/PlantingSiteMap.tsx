import React, { useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, useTheme } from '@mui/material';
import hexRgb from 'hex-rgb';
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

  const getRenderAttributes = useCallback(
    (objectType: 'site' | 'zone' | 'plot') => {
      const getRgbaFromHex = (hex: string, opacity: number) => {
        const rgba = hexRgb(hex, { alpha: opacity, format: 'object' });
        const { red, green, blue, alpha } = rgba;
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      };

      if (objectType === 'site') {
        return {
          fillColor: getRgbaFromHex(theme.palette.TwClrBasePurple200 as string, 0.2),
          lineColor: theme.palette.TwClrBasePurple300 as string,
          lineWidth: 1,
        };
      } else if (objectType === 'zone') {
        return {
          fillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen200 as string, 0.2),
          lineColor: theme.palette.TwClrBaseGreen300 as string,
          lineWidth: 1,
        };
      } else {
        // plot
        return {
          fillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue200 as string, 0.2),
          lineColor: theme.palette.TwClrBaseBlue300 as string,
          lineWidth: 1,
        };
      }
    },
    [
      theme.palette.TwClrBasePurple200,
      theme.palette.TwClrBasePurple300,
      theme.palette.TwClrBaseGreen200,
      theme.palette.TwClrBaseGreen300,
      theme.palette.TwClrBaseBlue200,
      theme.palette.TwClrBaseBlue300,
    ]
  );

  const getPolygons = useCallback((boundary?: Geometry): MapGeometry => {
    if (!boundary) {
      return [];
    }
    return boundary.coordinates;
  }, []);

  const extractPlantingSite = useCallback(
    (site: PlantingSite): MapSource => {
      const { id, name, description, boundary } = site;
      const renderAttributes = getRenderAttributes('site');

      return {
        properties: { id, name, description, type: 'site' },
        boundary: getPolygons(boundary),
        id: `site-${id}`,
        ...renderAttributes,
      };
    },
    [getPolygons, getRenderAttributes]
  );

  const extractPlantingZones = useCallback(
    (site: PlantingSite): MapSource[] | undefined => {
      const renderAttributes = getRenderAttributes('zone');

      return site.plantingZones?.map((zone) => {
        const { id, name, boundary } = zone;
        return {
          properties: { id, name, type: 'zone' },
          boundary: getPolygons(boundary),
          id: `zone-${id}`,
          ...renderAttributes,
        };
      });
    },
    [getPolygons, getRenderAttributes]
  );

  const extractPlots = useCallback(
    (site: PlantingSite): MapSource[] | undefined => {
      const renderAttributes = getRenderAttributes('plot');

      return site.plantingZones?.flatMap((zone) => {
        const { plots } = zone;
        return plots.map((plot) => {
          const { id, name, fullName, boundary } = plot;
          return {
            properties: { id, name, fullName, type: 'plot' },
            boundary: getPolygons(boundary),
            id: `plot-${id}`,
            ...renderAttributes,
            isInteractive: true,
            annotation: {
              textField: 'fullName',
              textColor: theme.palette.TwClrBaseWhite as string,
              textSize: 10,
            },
          };
        });
      });
    },
    [getPolygons, getRenderAttributes, theme.palette.TwClrBaseWhite]
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
        sources: [site, ...plots, ...zones],
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
