import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, useTheme } from '@mui/material';
import hexRgb from 'hex-rgb';
import { MultiPolygon, PlantingSite } from 'src/api/types/tracking';
import useSnackbar from 'src/utils/useSnackbar';
import GenericMap from './GenericMap';
import { MapEntityOptions, MapGeometry, MapOptions, MapPopupRenderer, MapSource } from './MapModels';
import { getBoundingBox } from './MapUtils';
import _ from 'lodash';

export type PlantingSiteMapProps = {
  plantingSite: PlantingSite;
  // style overrides
  style?: object;
  // context on-click renderer
  contextRenderer?: MapPopupRenderer;
  // selected plot
  selectedPlotId?: number;
  // selected zone
  selectedZoneId?: number;
};

export default function PlantingSiteMap(props: PlantingSiteMapProps): JSX.Element | null {
  const { plantingSite, style, contextRenderer, selectedPlotId, selectedZoneId } = props;
  const theme = useTheme();
  const [snackbar] = useState(useSnackbar());
  const [mapOptions, setMapOptions] = useState<MapOptions>();

  const getRenderAttributes = useCallback(
    (objectType: 'site' | 'zone' | 'plot') => {
      const getRgbaFromHex = (hex: string, opacity: number) => {
        const rgba = hexRgb(hex, { alpha: opacity, format: 'object' });
        const { red, green, blue, alpha } = rgba;
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      };

      if (objectType === 'site') {
        return {
          fillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.2),
          lineColor: theme.palette.TwClrBaseGreen300 as string,
          lineWidth: 2,
        };
      } else if (objectType === 'zone') {
        return {
          fillColor: 'transparent',
          lineColor: theme.palette.TwClrBaseLightGreen300 as string,
          lineWidth: 4,
        };
      } else {
        // plot
        return {
          fillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.2),
          hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.4),
          selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.6),
          highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.6),
          lineColor: theme.palette.TwClrBaseBlue300 as string,
          lineWidth: 2,
        };
      }
    },
    [theme.palette.TwClrBaseGreen300, theme.palette.TwClrBaseLightGreen300, theme.palette.TwClrBaseBlue300]
  );

  const getPolygons = useCallback((boundary?: MultiPolygon): MapGeometry => {
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
        entities: [
          {
            properties: { id, name, description, type: 'site' },
            boundary: getPolygons(boundary),
            id,
          },
        ],
        id: 'sites',
        ...renderAttributes,
      };
    },
    [getPolygons, getRenderAttributes]
  );

  const extractPlantingZones = useCallback(
    (site: PlantingSite): MapSource => {
      const renderAttributes = getRenderAttributes('zone');

      const zonesData =
        site.plantingZones?.map((zone) => {
          const { id, name, boundary } = zone;
          return {
            properties: { id, name, type: 'zone' },
            boundary: getPolygons(boundary),
            id,
          };
        }) || [];

      return {
        entities: zonesData,
        id: 'zones',
        ...renderAttributes,
      };
    },
    [getPolygons, getRenderAttributes]
  );

  const extractPlots = useCallback(
    (site: PlantingSite): MapSource => {
      const renderAttributes = getRenderAttributes('plot');

      const allPlotsData =
        site.plantingZones?.flatMap((zone) => {
          const { plots } = zone;
          return plots.map((plot) => {
            const { id, name, fullName, boundary } = plot;
            return {
              properties: { id, name, fullName, type: 'plot' },
              boundary: getPolygons(boundary),
              id,
            };
          });
        }) || [];

      return {
        entities: allPlotsData.flatMap((f) => f),
        id: 'plots',
        isInteractive: true,
        annotation: {
          textField: 'fullName',
          textColor: theme.palette.TwClrBaseWhite as string,
          textSize: 16,
        },
        ...renderAttributes,
      };
    },
    [getPolygons, getRenderAttributes, theme.palette.TwClrBaseWhite]
  );

  // fetch polygons and boundaries
  useEffect(() => {
    const fetchPlantingSite = () => {
      const site = extractPlantingSite(plantingSite);
      const zones = extractPlantingZones(plantingSite);
      const plots = extractPlots(plantingSite);

      const geometries: MapGeometry[] = [
        site.entities[0]?.boundary,
        ...(zones?.entities.map((s) => s.boundary) || []),
        ...(plots?.entities.map((s) => s.boundary) || []),
      ].filter((g) => g) as MapGeometry[];

      const newMapOptions = {
        bbox: getBoundingBox(geometries),
        sources: [site, plots, zones],
      };

      if (!_.isEqual(newMapOptions, mapOptions)) {
        setMapOptions(newMapOptions);
      }
    };

    fetchPlantingSite();
  }, [plantingSite, snackbar, extractPlantingSite, extractPlantingZones, extractPlots, mapOptions]);

  const entityOptions: MapEntityOptions = useMemo(
    () => ({
      highlight: { sourceId: 'plots', id: selectedPlotId },
      focus: { sourceId: 'zones', id: selectedZoneId },
    }),
    [selectedPlotId, selectedZoneId]
  );

  if (!mapOptions) {
    return (
      <Box sx={{ display: 'flex', flexGrow: 1, height: '100%', margin: 'auto' }}>
        <CircularProgress sx={{ margin: 'auto' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexGrow: 1 }}>
      <GenericMap options={mapOptions} contextRenderer={contextRenderer} style={style} entityOptions={entityOptions} />
    </Box>
  );
}
