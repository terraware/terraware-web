import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, useTheme } from '@mui/material';
import hexRgb from 'hex-rgb';
import { PlantingSite } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';
import GenericMap from './GenericMap';
import { MapEntityId, MapEntityOptions, MapOptions, MapPopupRenderer, MapSource } from 'src/types/Map';
import { MapService } from 'src/services';
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
  const snackbar = useSnackbar();
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

  const extractPlantingSite = useCallback(
    (site: PlantingSite): MapSource => {
      const renderAttributes = getRenderAttributes('site');

      return {
        ...MapService.extractPlantingSite(site),
        ...renderAttributes,
      };
    },
    [getRenderAttributes]
  );

  const extractPlantingZones = useCallback(
    (site: PlantingSite): MapSource => {
      const renderAttributes = getRenderAttributes('zone');

      return {
        ...MapService.extractPlantingZones(site),
        ...renderAttributes,
      };
    },
    [getRenderAttributes]
  );

  const extractPlots = useCallback(
    (site: PlantingSite): MapSource => {
      const renderAttributes = getRenderAttributes('plot');

      return {
        ...MapService.extractPlots(site),
        isInteractive: true,
        annotation: {
          textField: 'fullName',
          textColor: theme.palette.TwClrBaseWhite as string,
          textSize: 16,
        },
        ...renderAttributes,
      };
    },
    [getRenderAttributes, theme.palette.TwClrBaseWhite]
  );

  // fetch polygons and boundaries
  useEffect(() => {
    const fetchPlantingSite = () => {
      const site = extractPlantingSite(plantingSite);
      const zones = extractPlantingZones(plantingSite);
      const plots = extractPlots(plantingSite);

      const newMapOptions = {
        bbox: MapService.getPlantingSiteBoundingBox(plantingSite),
        sources: [site, plots, zones],
      };

      if (!_.isEqual(newMapOptions, mapOptions)) {
        setMapOptions(newMapOptions);
      }
    };

    fetchPlantingSite();
  }, [plantingSite, snackbar, extractPlantingSite, extractPlantingZones, extractPlots, mapOptions]);

  const plotEntity: MapEntityId = useMemo(() => ({ sourceId: 'plots', id: selectedPlotId }), [selectedPlotId]);

  const zoneEntity: MapEntityId = useMemo(() => ({ sourceId: 'zones', id: selectedZoneId }), [selectedZoneId]);

  const entityOptions: MapEntityOptions = useMemo(
    () => ({
      highlight: plotEntity,
      focus: zoneEntity,
    }),
    [plotEntity, zoneEntity]
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
