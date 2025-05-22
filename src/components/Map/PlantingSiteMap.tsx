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
    name: 'mortality-rate-indicator',
    url: '/assets/mortality-rate-indicator.png',
  },
  {
    name: 'mortality-rate-less-25',
    url: '/assets/mortality-rate-less-25.png',
  },
  {
    name: 'mortality-rate-less-50',
    url: '/assets/mortality-rate-less-50.png',
  },
  {
    name: 'mortality-rate-more-50',
    url: '/assets/mortality-rate-more-50.png',
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
  showMortalityRateFill?: boolean;
  showRecencyFill?: boolean;
  zoneInteractive?: boolean;
  subzoneInteractive?: boolean;
} & MapControl;

export default function PlantingSiteMap(props: PlantingSiteMapProps): JSX.Element | null {
  const {
    mapData,
    style,
    contextRenderer,
    highlightEntities,
    focusEntities,
    layers,
    showMortalityRateFill,
    showRecencyFill,
    zoneInteractive,
    subzoneInteractive,
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
                ['==', ['get', 'recency'], 0],
                getRenderAttributes('subzone').fillColor,
                ['==', ['get', 'recency'], 1],
                getRgbaFromHex(theme.palette.TwClrBasePink200 as string, 0.9),
                ['==', ['get', 'recency'], 2],
                getRgbaFromHex(theme.palette.TwClrBasePink200 as string, 0.7),
                ['==', ['get', 'recency'], 3],
                getRgbaFromHex(theme.palette.TwClrBasePink200 as string, 0.5),
                getRgbaFromHex(theme.palette.TwClrBasePink200 as string, 0.3),
              ]
            : getRenderAttributes('subzone').fillColor,
          patternFill: showMortalityRateFill
            ? [
                'case',
                ['>', ['number', ['get', 'mortalityRate']], 50],
                'mortality-rate-more-50',
                ['>', ['number', ['get', 'mortalityRate']], 25],
                'mortality-rate-less-50',
                'mortality-rate-less-25',
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
    showMortalityRateFill,
    showRecencyFill,
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
        {...controlProps}
      />
    </Box>
  );
}
