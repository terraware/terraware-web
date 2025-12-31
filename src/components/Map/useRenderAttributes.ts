import { useCallback } from 'react';

import { useTheme } from '@mui/material';

import { MapSourceRenderProperties, RenderableObject } from 'src/types/Map';
import { getRgbaFromHex } from 'src/utils/color';

export default function useRenderAttributes(): (type: RenderableObject) => MapSourceRenderProperties {
  const theme = useTheme();

  const getRenderAttributes = useCallback(
    (objectType: RenderableObject): MapSourceRenderProperties => {
      switch (objectType) {
        case 'site':
          return {
            fillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.2),
            highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.6),
            hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.4),
            lineColor: theme.palette.TwClrBaseGreen300 as string,
            lineWidth: 2,
            selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.6),
          };
        case 'stratum':
          return {
            fillColor: 'transparent',
            highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.2),
            hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.4),
            lineColor: theme.palette.TwClrBaseLightGreen300 as string,
            lineWidth: 4,
            selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.6),
          };
        case 'draft-stratum':
          return {
            fillColor: 'transparent',
            highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.2),
            hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.4),
            lineColor: theme.palette.TwClrBaseLightGreen300 as string,
            lineWidth: 4,
            selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.1),
            selectLineColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.6),
            selectLineWidth: 8,
          };
        case 'substratum':
          return {
            fillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.2),
            highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.6),
            hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.4),
            lineColor: theme.palette.TwClrBaseBlue300 as string,
            lineWidth: 2,
            selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.6),
          };
        case 'draft-substratum':
          return {
            fillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.2),
            highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.6),
            hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.4),
            lineColor: theme.palette.TwClrBaseBlue300 as string,
            lineWidth: 2,
            selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.5),
            selectLineColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.6),
            selectLineWidth: 6,
          };
        case 'countryBoundary': // uses the same color as permanentPlot at time of writing
        case 'permanentPlot':
          return {
            fillColor: getRgbaFromHex(theme.palette.TwClrBasePink300 as string, 0.2),
            highlightFillColor: getRgbaFromHex(theme.palette.TwClrBasePink300 as string, 0.6),
            hoverFillColor: getRgbaFromHex(theme.palette.TwClrBasePink300 as string, 0.4),
            lineColor: theme.palette.TwClrBasePink300 as string,
            lineWidth: 2,
            selectFillColor: getRgbaFromHex(theme.palette.TwClrBasePink300 as string, 0.6),
          };
        case 'adHocPlot':
          return {
            fillColor: getRgbaFromHex(theme.palette.TwClrBaseOrange300 as string, 0.2),
            highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseOrange300 as string, 0.6),
            hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseOrange300 as string, 0.4),
            lineColor: theme.palette.TwClrBaseOrange300 as string,
            lineWidth: 2,
            selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseOrange300 as string, 0.6),
          };
        case 'boundary':
          // Only highlight border
          return {
            fillColor: getRgbaFromHex(theme.palette.TwClrBaseWhite as string, 0),
            hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseWhite as string, 0),
            selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseWhite as string, 0),
            highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseWhite as string, 0),
            lineColor: theme.palette.TwClrBaseGreen300 as string,
            lineWidth: 2,
          };
        case 'strataBoundary':
          return {
            fillColor: getRgbaFromHex(theme.palette.TwClrBaseOrange400 as string, 0.2),
            hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseOrange400 as string, 0.4),
            selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseWhite as string, 0),
            highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseWhite as string, 0),
            lineColor: theme.palette.TwClrBaseOrange400 as string,
            lineWidth: 2,
          };
        default:
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
    [theme]
  );

  return getRenderAttributes;
}
