import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Theme, useTheme } from '@mui/material';
import useSnackbar from 'src/utils/useSnackbar';
import GenericMap from './GenericMap';
import {
  MapData,
  MapEntityId,
  MapEntityOptions,
  MapObject,
  MapOptions,
  MapPopupRenderer,
  MapSource,
} from 'src/types/Map';
import { MapService } from 'src/services';
import _ from 'lodash';
import { MapLayer } from 'src/components/common/MapLayerSelect';
import { makeStyles } from '@mui/styles';
import { getRgbaFromHex } from 'src/utils/color';

const mapImages = [
  {
    name: 'mortality-rate-indicator',
    url: '/assets/mortality-rate-indicator.png',
  },
];

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
  mapData: MapData;
  // style overrides
  style?: object;
  // context on-click renderer
  contextRenderer?: MapPopupRenderer;
  highlightEntities?: MapEntityId[];
  focusEntities?: MapEntityId[];
  // layers to be displayed on map
  layers?: MapLayer[];
  bottomLeftMapControl?: React.ReactNode;
  topRightMapControl?: React.ReactNode;
  showMortalityRateFill?: boolean;
};

export default function PlantingSiteMap(props: PlantingSiteMapProps): JSX.Element | null {
  const {
    mapData,
    style,
    contextRenderer,
    highlightEntities,
    focusEntities,
    layers,
    bottomLeftMapControl,
    topRightMapControl,
    showMortalityRateFill,
  } = props;
  const theme = useTheme();
  const classes = useStyles();
  const snackbar = useSnackbar();
  const [mapOptions, setMapOptions] = useState<MapOptions>();

  const getRenderAttributes = useCallback(
    (objectType: MapObject) => {
      if (objectType === 'site') {
        return {
          fillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.2),
          hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.4),
          selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.6),
          highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.6),
          lineColor: theme.palette.TwClrBaseGreen300 as string,
          lineWidth: 2,
        };
      } else if (objectType === 'zone') {
        return {
          fillColor: 'transparent',
          hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.4),
          selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.6),
          highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.2),
          lineColor: theme.palette.TwClrBaseLightGreen300 as string,
          lineWidth: 4,
        };
      } else if (objectType === 'subzone') {
        return {
          fillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.2),
          hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.4),
          selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.6),
          highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.6),
          lineColor: theme.palette.TwClrBaseBlue300 as string,
          lineWidth: 2,
        };
      } else if (objectType === 'permanentPlot') {
        return {
          fillColor: getRgbaFromHex(theme.palette.TwClrBasePink300 as string, 0.2),
          hoverFillColor: getRgbaFromHex(theme.palette.TwClrBasePink300 as string, 0.4),
          selectFillColor: getRgbaFromHex(theme.palette.TwClrBasePink300 as string, 0.6),
          highlightFillColor: getRgbaFromHex(theme.palette.TwClrBasePink300 as string, 0.6),
          lineColor: theme.palette.TwClrBasePink300 as string,
          lineWidth: 2,
        };
      } else {
        // temporary plot
        return {
          fillColor: getRgbaFromHex(theme.palette.TwClrBaseYellow300 as string, 0.2),
          hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseYellow300 as string, 0.4),
          selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseYellow300 as string, 0.6),
          highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseYellow300 as string, 0.6),
          lineColor: theme.palette.TwClrBaseYellow300 as string,
          lineWidth: 2,
        };
      }
    },
    [
      theme.palette.TwClrBaseGreen300,
      theme.palette.TwClrBaseLightGreen300,
      theme.palette.TwClrBaseBlue300,
      theme.palette.TwClrBasePink300,
      theme.palette.TwClrBaseYellow300,
    ]
  );

  // fetch polygons and boundaries
  useEffect(() => {
    const fetchPlantingSite = () => {
      const sources = new Array<MapSource>();

      // The first layer added to sources will render on top of subsequent layers. We want to attach interactivity
      // and display annotations for this layer only.
      const isFirstLayerAdded = () => sources.length === 0;
      if (layers === undefined || layers?.includes('Monitoring Plots')) {
        const monitoringPlotsFirst = isFirstLayerAdded();
        if (mapData.temporaryPlot) {
          sources.push({
            ...mapData.temporaryPlot,
            isInteractive: monitoringPlotsFirst,
            annotation: monitoringPlotsFirst
              ? {
                  textField: 'name',
                  textColor: theme.palette.TwClrBaseWhite as string,
                  textSize: 12,
                }
              : undefined,
            ...getRenderAttributes('temporaryPlot'),
          });
        }
        if (mapData.permanentPlot) {
          sources.push({
            ...mapData.permanentPlot,
            isInteractive: monitoringPlotsFirst,
            annotation: monitoringPlotsFirst
              ? {
                  textField: 'name',
                  textColor: theme.palette.TwClrBaseWhite as string,
                  textSize: 12,
                }
              : undefined,
            ...getRenderAttributes('permanentPlot'),
          });
        }
      }
      if (mapData.subzone && (layers === undefined || layers?.includes('Sub-Zones'))) {
        sources.push({
          ...mapData.subzone,
          isInteractive: isFirstLayerAdded(),
          annotation: isFirstLayerAdded()
            ? {
                textField: 'fullName',
                textColor: theme.palette.TwClrBaseWhite as string,
                textSize: 16,
              }
            : undefined,
          ...getRenderAttributes('subzone'),
        });
      }
      if (mapData.zone && (layers === undefined || layers?.includes('Zones'))) {
        sources.push({
          ...mapData.zone,
          isInteractive: isFirstLayerAdded(),
          annotation: isFirstLayerAdded()
            ? {
                textField: 'name',
                textColor: theme.palette.TwClrBaseWhite as string,
                textSize: 16,
              }
            : undefined,
          patternFill: showMortalityRateFill
            ? {
                imageName: 'mortality-rate-indicator',
                opacityExpression: [
                  'case',
                  ['==', ['get', 'mortalityRate'], null],
                  0.0,
                  ['>', ['get', 'mortalityRate'], 0.5],
                  0.7,
                  ['>', ['get', 'mortalityRate'], 0.25],
                  0.5,
                  0.3,
                ],
              }
            : undefined,
          ...getRenderAttributes('zone'),
        });
      }
      if (mapData.site && (layers === undefined || layers?.includes('Planting Site'))) {
        sources.push({
          ...mapData.site,
          isInteractive: isFirstLayerAdded(),
          annotation: isFirstLayerAdded()
            ? {
                textField: 'name',
                textColor: theme.palette.TwClrBaseWhite as string,
                textSize: 16,
              }
            : undefined,
          ...getRenderAttributes('site'),
        });
      }

      const newMapOptions = {
        bbox: MapService.getPlantingSiteBoundingBox(mapData),
        sources,
      };

      if (!_.isEqual(newMapOptions, mapOptions)) {
        setMapOptions(newMapOptions);
      }
    };

    fetchPlantingSite();
  }, [mapData, snackbar, mapOptions, layers, theme.palette.TwClrBaseWhite, getRenderAttributes, showMortalityRateFill]);

  const entityOptions: MapEntityOptions = useMemo(
    () => ({
      highlight: highlightEntities,
      focus: focusEntities,
    }),
    [highlightEntities, focusEntities]
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
      <GenericMap
        options={mapOptions}
        contextRenderer={contextRenderer}
        style={style}
        entityOptions={entityOptions}
        mapImages={mapImages}
      />
      {topRightMapControl && <div className={classes.topRightControl}>{topRightMapControl}</div>}
      {bottomLeftMapControl && <div className={classes.bottomLeftControl}>{bottomLeftMapControl}</div>}
    </Box>
  );
}
