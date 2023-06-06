import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Theme, useTheme } from '@mui/material';
import hexRgb from 'hex-rgb';
import { PlantingSite } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';
import GenericMap from './GenericMap';
import { MapEntityId, MapEntityOptions, MapOptions, MapPopupRenderer, MapSource } from 'src/types/Map';
import { MapService } from 'src/services';
import _ from 'lodash';
import { MapLayer } from 'src/components/common/MapLayerSelect';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  bottomLeftControl: {
    height: 'max-content',
    position: 'absolute',
    left: theme.spacing(2),
    bottom: theme.spacing(4),
    width: 'max-content',
    zIndex: 1000,
  },
  topRightControl: {
    height: 'max-content',
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(2),
    width: 'max-content',
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
  // layers to be displayed on map
  layers?: MapLayer[];
  bottomLeftMapControl?: React.ReactNode;
  topRightMapControl?: React.ReactNode;
};

export default function PlantingSiteMap(props: PlantingSiteMapProps): JSX.Element | null {
  const {
    plantingSite,
    style,
    contextRenderer,
    selectedSubzoneId,
    selectedZoneId,
    layers,
    bottomLeftMapControl,
    topRightMapControl,
  } = props;
  const theme = useTheme();
  const classes = useStyles();
  const snackbar = useSnackbar();
  const [mapOptions, setMapOptions] = useState<MapOptions>();

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
      if (layers === undefined || layers?.includes('Sub-Zones')) {
        includedSources.push(subzones);
      }
      if (layers === undefined || layers?.includes('Zones')) {
        includedSources.push(zones);
      }
      if (layers === undefined || layers?.includes('Planting Site')) {
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
  }, [plantingSite, snackbar, extractPlantingSite, extractPlantingZones, extractSubzones, mapOptions, layers]);

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

  if (!mapOptions) {
    return (
      <Box sx={{ display: 'flex', flexGrow: 1, height: '100%', margin: 'auto' }}>
        <CircularProgress sx={{ margin: 'auto' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, position: 'relative', minHeight: '436px' }}>
      <GenericMap options={mapOptions} contextRenderer={contextRenderer} style={style} entityOptions={entityOptions} />
      {topRightMapControl && <div className={classes.topRightControl}>{topRightMapControl}</div>}
      {bottomLeftMapControl && <div className={classes.bottomLeftControl}>{bottomLeftMapControl}</div>}
    </Box>
  );
}
