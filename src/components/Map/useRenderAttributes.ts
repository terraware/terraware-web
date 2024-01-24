import { useCallback } from 'react';
import { useTheme } from '@mui/material';
import { getRgbaFromHex } from 'src/utils/color';
import { MapSourceRenderProperties, RenderableObject } from 'src/types/Map';

export default function useRenderAttributes(): (type: RenderableObject) => MapSourceRenderProperties {
  const theme = useTheme();

  const getRenderAttributes = useCallback(
    (objectType: RenderableObject): MapSourceRenderProperties => {
      if (objectType === 'site') {
        return {
          fillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.2),
          highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.6),
          hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.4),
          lineColor: theme.palette.TwClrBaseGreen300 as string,
          lineWidth: 2,
          selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.6),
        };
      } else if (objectType === 'zone') {
        return {
          fillColor: 'transparent',
          highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.2),
          hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.4),
          lineColor: theme.palette.TwClrBaseLightGreen300 as string,
          lineWidth: 4,
          selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.6),
        };
      } else if (objectType === 'draft-zone') {
        return {
          fillColor: 'transparent',
          highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.2),
          hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.4),
          lineColor: theme.palette.TwClrBaseLightGreen300 as string,
          lineWidth: 4,
          selectLineColor: getRgbaFromHex(theme.palette.TwClrBaseLightGreen300 as string, 0.6),
          selectLineWidth: 8,
        };
      } else if (objectType === 'subzone') {
        return {
          fillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.2),
          highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.6),
          hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.4),
          lineColor: theme.palette.TwClrBaseBlue300 as string,
          lineWidth: 2,
          selectFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.6),
        };
      } else if (objectType === 'draft-subzone') {
        return {
          fillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.2),
          highlightFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.6),
          hoverFillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.4),
          lineColor: theme.palette.TwClrBaseBlue300 as string,
          lineWidth: 2,
          selectLineColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.6),
          selectLineWidth: 12,
        };
      } else if (objectType === 'permanentPlot') {
        return {
          fillColor: getRgbaFromHex(theme.palette.TwClrBasePink300 as string, 0.2),
          highlightFillColor: getRgbaFromHex(theme.palette.TwClrBasePink300 as string, 0.6),
          hoverFillColor: getRgbaFromHex(theme.palette.TwClrBasePink300 as string, 0.4),
          lineColor: theme.palette.TwClrBasePink300 as string,
          lineWidth: 2,
          selectFillColor: getRgbaFromHex(theme.palette.TwClrBasePink300 as string, 0.6),
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

  return getRenderAttributes;
}
