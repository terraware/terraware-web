import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Theme, useTheme } from '@mui/material';
import hexRgb from 'hex-rgb';
import { PlantingSite } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';
import GenericMap from './GenericMap';
import { MapEntityId, MapEntityOptions, MapOptions, MapPopupRenderer, MapSource } from 'src/types/Map';
import { MapService } from 'src/services';
import _ from 'lodash';
import MapLayerSelect, { MapLayer } from 'src/components/common/MapLayerSelect';
import strings from 'src/strings';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  layerSelectContainer: {
    height: theme.spacing(3),
    position: 'relative',
    right: theme.spacing(5.5),
    top: theme.spacing(2),
    width: theme.spacing(3),
    zIndex: 1000,
  },
}));

export type PlantingSiteMapProps = {
  plantingSite: PlantingSite;
  // style overrides
  style?: object;
  // context on-click renderer
  contextRenderer?: MapPopupRenderer;
  // selected subzone
  selectedSubzoneId?: number;
  // selected zone
  selectedZoneId?: number;
  layerOptions?: MapLayer[];
};

export default function PlantingSiteMap(props: PlantingSiteMapProps): JSX.Element | null {
  const { plantingSite, style, contextRenderer, selectedSubzoneId, selectedZoneId, layerOptions } = props;
  const theme = useTheme();
  const classes = useStyles();
  const snackbar = useSnackbar();
  const [mapOptions, setMapOptions] = useState<MapOptions>();
  const [includedLayers, setIncludedLayers] = useState<MapLayer[] | undefined>(layerOptions);

  const getRenderAttributes = useCallback(
    (objectType: 'site' | 'zone' | 'subzone') => {
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
        // subzone
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

  const extractSubzones = useCallback(
    (site: PlantingSite): MapSource => {
      const renderAttributes = getRenderAttributes('subzone');

      return {
        ...MapService.extractSubzones(site),
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
      const subzones = extractSubzones(plantingSite);

      const includedSources = new Array<MapSource>();
      if (includedLayers === undefined || includedLayers?.includes('Sub-Zones')) {
        includedSources.push(subzones);
      }
      if (includedLayers === undefined || includedLayers?.includes('Zones')) {
        includedSources.push(zones);
      }
      if (includedLayers === undefined || includedLayers?.includes('Planting Site')) {
        includedSources.push(site);
      }

      const newMapOptions = {
        bbox: MapService.getPlantingSiteBoundingBox(plantingSite),
        sources: includedSources,
      };

      if (!_.isEqual(newMapOptions, mapOptions)) {
        setMapOptions(newMapOptions);
      }
    };

    fetchPlantingSite();
  }, [plantingSite, snackbar, extractPlantingSite, extractPlantingZones, extractSubzones, mapOptions, includedLayers]);

  const subzoneEntity: MapEntityId = useMemo(
    () => ({ sourceId: 'subzones', id: selectedSubzoneId }),
    [selectedSubzoneId]
  );

  const zoneEntity: MapEntityId = useMemo(() => ({ sourceId: 'zones', id: selectedZoneId }), [selectedZoneId]);

  const entityOptions: MapEntityOptions = useMemo(
    () => ({
      highlight: subzoneEntity,
      focus: zoneEntity,
    }),
    [subzoneEntity, zoneEntity]
  );

  const layerOptionLabels: Record<MapLayer, string> = {
    'Planting Site': strings.PLANTING_SITE,
    Zones: strings.ZONES,
    'Sub-Zones': strings.SUBZONES,
    'Monitoring Plots': strings.MONITORING_PLOTS,
  };

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
      {layerOptions && (
        <div className={classes.layerSelectContainer}>
          <MapLayerSelect
            initialSelection={layerOptions}
            onUpdateSelection={(selection) => setIncludedLayers(selection)}
            menuSections={[
              layerOptions.map((opt) => ({
                label: layerOptionLabels[opt],
                value: opt,
              })),
            ]}
          />
        </div>
      )}
    </Box>
  );
}
