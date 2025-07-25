import React, { useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import MapLegend from 'src/components/common/MapLegend';
import strings from 'src/strings';
import { getRgbaFromHex } from 'src/utils/color';

export type PlantingSiteMapLegendOption = 'site' | 'zone' | 'subzone' | 'permanentPlot' | 'temporaryPlot' | 'adHocPlot';

export type PlantingSiteMapLegendProps = {
  options: PlantingSiteMapLegendOption[];
  onChangeLayer?: (layer: string) => void;
  selectedLayer?: string;
  disableLegends?: boolean;
};

export default function PlantingSiteMapLegend({
  options,
  onChangeLayer,
  selectedLayer,
  disableLegends,
}: PlantingSiteMapLegendProps): JSX.Element {
  const theme = useTheme();
  const hasSite = !!options.find((opt) => opt === 'site');
  const hasZone = !!options.find((opt) => opt === 'zone');
  const hasSubzone = !!options.find((opt) => opt === 'subzone');
  const hasPermanentPlot = !!options.find((opt) => opt === 'permanentPlot');
  const hasTemporaryPlot = !!options.find((opt) => opt === 'temporaryPlot');
  const hasAdHocPlot = !!options.find((opt) => opt === 'adHocPlot');

  const legends = useMemo(() => {
    const items = [];

    if (hasSite) {
      items.push({
        label: strings.PLANTING_SITE,
        borderColor: theme.palette.TwClrBaseGreen300 as string,
        fillColor: getRgbaFromHex(theme.palette.TwClrBaseGreen300 as string, 0.2),
      });
    }

    if (hasZone) {
      items.push({
        label: strings.ZONES,
        borderColor: theme.palette.TwClrBaseLightGreen300 as string,
        fillColor: 'transparent',
      });
    }

    if (hasSubzone) {
      items.push({
        label: strings.SUBZONES,
        borderColor: theme.palette.TwClrBaseBlue300 as string,
        fillColor: getRgbaFromHex(theme.palette.TwClrBaseBlue300 as string, 0.2),
      });
    }

    if (hasPermanentPlot) {
      items.push({
        label: strings.PLOTS_PERMANENT,
        borderColor: theme.palette.TwClrBasePink300 as string,
        fillColor: getRgbaFromHex(theme.palette.TwClrBasePink300 as string, 0.2),
      });
    }

    if (hasTemporaryPlot) {
      items.push({
        label: strings.PLOTS_TEMPORARY,
        borderColor: theme.palette.TwClrBaseYellow300 as string,
        fillColor: getRgbaFromHex(theme.palette.TwClrBaseYellow300 as string, 0.2),
      });
    }

    if (hasAdHocPlot) {
      items.push({
        label: strings.PLOTS_AD_HOC,
        borderColor: theme.palette.TwClrBaseOrange300 as string,
        fillColor: getRgbaFromHex(theme.palette.TwClrBaseOrange300 as string, 0.2),
      });
    }

    return [
      {
        title: strings.BOUNDARIES,
        items,
      },
    ];
  }, [hasSite, hasZone, hasSubzone, hasPermanentPlot, hasTemporaryPlot, theme, hasAdHocPlot]);

  return (
    <Box display='flex'>
      <MapLegend
        legends={legends}
        onChangeLayer={onChangeLayer}
        selectedLayer={selectedLayer}
        disableLegends={disableLegends}
      />
    </Box>
  );
}
