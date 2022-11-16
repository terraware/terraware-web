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
  const snackbar = useSnackbar();
  const [token, setToken] = useState<string>();
  const [mapOptions, setMapOptions] = useState<MapOptions>();
  const [mapId, setMapId] = useState<string>();
  const popupRenderer: MapPopupRenderer = useDefaultPopupRenderer();

  const getRenderAttributes = useCallback(
    (objectType: 'site' | 'zone' | 'plot') => {
      const fillColor = theme.palette.TwClrBaseWhite || 'white';
      const fillOpacity = 0.1;

      if (objectType === 'site') {
        return {
          fillColor,
          fillOpacity,
          lineColor: '#3F9188', // tokens not available today
          lineWidth: 1,
        };
      } else if (objectType === 'zone') {
        return {
          fillColor,
          fillOpacity,
          lineColor: '#86BA3E', // tokens not available today
          lineWidth: 4,
        };
      } else {
        // plot
        return {
          fillColor,
          fillOpacity,
          lineColor: '#A4B5C6', // tokens not available today
          lineWidth: 2,
        };
      }
    },
    [theme.palette.TwClrBaseWhite]
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
      const { fillColor, fillOpacity, lineColor, lineWidth } = renderAttributes;

      return {
        properties: { id, name, description, type: 'site' },
        boundary: getPolygons(boundary),
        id: `site-${id}`,
        fillColor,
        fillOpacity,
        lineColor,
        lineWidth,
      };
    },
    [getPolygons, getRenderAttributes]
  );

  const extractPlantingZones = useCallback(
    (site: PlantingSite): MapSource[] | undefined => {
      const renderAttributes = getRenderAttributes('zone');
      const { fillColor, fillOpacity, lineColor, lineWidth } = renderAttributes;

      return site.plantingZones?.map((zone) => {
        const { id, name, boundary } = zone;
        return {
          properties: { id, name, type: 'zone' },
          boundary: getPolygons(boundary),
          id: `zone-${id}`,
          fillColor,
          fillOpacity,
          lineColor,
          lineWidth,
        };
      });
    },
    [getPolygons, getRenderAttributes]
  );

  const extractPlots = useCallback(
    (site: PlantingSite): MapSource[] | undefined => {
      const renderAttributes = getRenderAttributes('plot');
      const { fillColor, fillOpacity, lineColor, lineWidth } = renderAttributes;

      return site.plantingZones?.flatMap((zone) => {
        const { plots } = zone;
        return plots.map((plot) => {
          const { id, name, fullName, boundary } = plot;
          return {
            properties: { id, name, fullName, type: 'plot' },
            boundary: getPolygons(boundary),
            id: `plot-${id}`,
            fillColor,
            fillOpacity,
            lineColor,
            lineWidth,
            isInteractive: true,
            annotation: {
              textField: 'fullName',
              textColor: fillColor,
              textSize: 10, // no tokens available yet
            },
          };
        });
      });
    },
    [getPolygons, getRenderAttributes]
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
