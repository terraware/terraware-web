import React, { useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress, useTheme } from '@mui/material';
import _ from 'lodash';

import { MapLayer } from 'src/components/common/MapLayerSelect';
import { MapService } from 'src/services';
import {
  MapControl,
  MapData,
  MapEntityId,
  MapEntityOptions,
  MapOptions,
  MapPopupRenderer,
  MapSource,
} from 'src/types/Map';
import { getRgbaFromHex } from 'src/utils/color';
import useSnackbar from 'src/utils/useSnackbar';

import GenericMap from './GenericMap';
import useRenderAttributes from './useRenderAttributes';

const mapImages = [
  {
    name: 'survival-rate-indicator',
    url: '/assets/survival-rate-indicator.png',
  },
  {
    name: 'survival-rate-less-50',
    url: '/assets/survival-rate-less-50.png',
  },
  {
    name: 'survival-rate-more-50',
    url: '/assets/survival-rate-more-50.png',
  },
  {
    name: 'survival-rate-more-75',
    url: '/assets/survival-rate-more-75.png',
  },
];

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
  showRecencyFill?: boolean;
  showSurvivalRateFill?: boolean;
  zoneInteractive?: boolean;
  subzoneInteractive?: boolean;
  showSiteMarker?: boolean;
  minHeight?: string;
} & MapControl;

export default function PlantingSiteMap(props: PlantingSiteMapProps): JSX.Element | null {
  const {
    mapData,
    style,
    contextRenderer,
    highlightEntities,
    focusEntities,
    layers,
    showRecencyFill,
    showSurvivalRateFill,
    zoneInteractive,
    subzoneInteractive,
    showSiteMarker,
    minHeight,
  } = props;
  const { ...controlProps }: MapControl = props;
  const theme = useTheme();
  const snackbar = useSnackbar();
  const [mapOptions, setMapOptions] = useState<MapOptions>();
  const getRenderAttributes = useRenderAttributes();

  // fetch polygons and boundaries
  useEffect(() => {
    const fetchPlantingSite = () => {
      const sources = new Array<MapSource>();

      // The first layer added to sources will render on top of subsequent layers. We want to attach interactivity
      // and display annotations for this layer only.
      const isFirstLayerAdded = () => sources.length === 0;
      if (layers === undefined || layers?.includes('Monitoring Plots')) {
        const monitoringPlotsFirst = isFirstLayerAdded();
        if (mapData.temporaryPlot && mapData.temporaryPlot.entities.length > 0) {
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
        if (mapData.permanentPlot && mapData.permanentPlot.entities.length > 0) {
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
        if (mapData.adHocPlot && mapData.adHocPlot.entities.length > 0) {
          sources.push({
            ...mapData.adHocPlot,
            isInteractive: monitoringPlotsFirst,
            annotation: monitoringPlotsFirst
              ? {
                  textField: 'name',
                  textColor: theme.palette.TwClrBaseWhite as string,
                  textSize: 12,
                }
              : undefined,
            ...getRenderAttributes('adHocPlot'),
          });
        }
      }
      if (mapData.subzone && (layers === undefined || layers?.includes('Sub-Zones'))) {
        sources.push({
          ...mapData.subzone,
          ...getRenderAttributes('subzone'),
          isInteractive: subzoneInteractive !== undefined ? subzoneInteractive : isFirstLayerAdded(),
          annotation: isFirstLayerAdded()
            ? {
                textField: 'name',
                textColor: theme.palette.TwClrBaseWhite as string,
                textSize: 16,
              }
            : undefined,
          fillColor: showRecencyFill
            ? [
                'case',
                ['==', ['get', 'recency'], -1],
                getRenderAttributes('subzone').fillColor,
                ['==', ['get', 'recency'], 0],
                getRenderAttributes('subzone').fillColor,
                ['==', ['get', 'recency'], 1],
                getRgbaFromHex(theme.palette.TwClrBasePink200 as string, 0.9),
                ['==', ['get', 'recency'], 2],
                getRgbaFromHex(theme.palette.TwClrBasePink200 as string, 0.7),
                ['==', ['get', 'recency'], 3],
                getRgbaFromHex(theme.palette.TwClrBasePink200 as string, 0.5),
                ['==', ['get', 'recency'], 4],
                getRgbaFromHex(theme.palette.TwClrBasePink200 as string, 0.3),
                ['==', ['get', 'recency'], 5],
                getRgbaFromHex(theme.palette.TwClrBasePink200 as string, 0.1),
                getRenderAttributes('subzone').fillColor,
              ]
            : getRenderAttributes('subzone').fillColor,
          patternFill: showSurvivalRateFill
            ? [
                'case',
                ['>', ['number', ['get', 'survivalRate']], 75],
                'survival-rate-more-75',
                ['>', ['number', ['get', 'survivalRate']], 50],
                'survival-rate-more-50',
                'survival-rate-less-50',
              ]
            : undefined,
        });
      }
      if (mapData.zone && (layers === undefined || layers?.includes('Zones'))) {
        sources.push({
          ...mapData.zone,
          ...getRenderAttributes('zone'),
          isInteractive: zoneInteractive !== undefined ? zoneInteractive : isFirstLayerAdded(),
          annotation: isFirstLayerAdded()
            ? {
                textField: 'name',
                textColor: theme.palette.TwClrBaseWhite as string,
                textSize: 16,
              }
            : undefined,
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

      if (mapData.site && (layers === undefined || layers?.includes('Project Zones'))) {
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
          ...getRenderAttributes('projectZonesBoundary'),
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
  }, [
    mapData,
    snackbar,
    mapOptions,
    layers,
    getRenderAttributes,
    showRecencyFill,
    showSurvivalRateFill,
    subzoneInteractive,
    theme,
    zoneInteractive,
  ]);

  const entityOptions: MapEntityOptions = useMemo(
    () => ({
      highlight: highlightEntities,
      focus: focusEntities,
    }),
    [highlightEntities, focusEntities]
  );

  const layerIdOrder = useMemo(
    () =>
      [
        mapData.site ? `${mapData.site.id}-fill` : undefined,
        mapData.zone ? `${mapData.zone.id}-fill` : undefined,
        mapData.subzone ? `${mapData.subzone.id}-fill` : undefined,
        mapData.adHocPlot ? `${mapData.adHocPlot.id}-fill` : undefined,
        mapData.permanentPlot ? `${mapData.permanentPlot.id}-fill` : undefined,
        mapData.temporaryPlot ? `${mapData.temporaryPlot.id}-fill` : undefined,
      ].filter((id): id is string => id !== undefined),
    [mapData]
  );

  if (!mapOptions) {
    return (
      <Box sx={{ display: 'flex', flexGrow: 1, height: '100%', margin: 'auto' }}>
        <CircularProgress sx={{ margin: 'auto' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, position: 'relative', minHeight: minHeight ?? '436px' }}>
      <GenericMap
        options={mapOptions}
        contextRenderer={contextRenderer}
        style={style}
        entityOptions={entityOptions}
        mapImages={mapImages}
        showSiteMarker={showSiteMarker}
        layerIdOrder={layerIdOrder}
        {...controlProps}
      />
    </Box>
  );
}
