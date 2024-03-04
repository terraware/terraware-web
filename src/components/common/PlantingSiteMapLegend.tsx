import { useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import MapLegend from 'src/components/common/MapLegend';
import strings from 'src/strings';
import { getRgbaFromHex } from 'src/utils/color';

export type PlantingSiteMapLegendOption = 'site' | 'zone' | 'subzone' | 'permanentPlot' | 'temporaryPlot';

export type PlantingSiteMapLegendProps = {
  options: PlantingSiteMapLegendOption[];
};

export default function PlantingSiteMapLegend({ options }: PlantingSiteMapLegendProps): JSX.Element {
  const theme = useTheme();
  const hasSite = !!options.find((opt) => opt === 'site');
  const hasZone = !!options.find((opt) => opt === 'zone');
  const hasSubzone = !!options.find((opt) => opt === 'subzone');
  const hasPermanentPlot = !!options.find((opt) => opt === 'permanentPlot');
  const hasTemporaryPlot = !!options.find((opt) => opt === 'temporaryPlot');

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

    return [
      {
        title: strings.BOUNDARIES,
        items,
      },
    ];
  }, [
    hasSite,
    hasZone,
    hasSubzone,
    hasPermanentPlot,
    hasTemporaryPlot,
    theme.palette.TwClrBaseGreen300,
    theme.palette.TwClrBaseLightGreen300,
    theme.palette.TwClrBaseBlue300,
    theme.palette.TwClrBasePink300,
    theme.palette.TwClrBaseYellow300,
  ]);

  return (
    <Box marginBottom={theme.spacing(2)} display='flex' flexDirection='column'>
      <MapLegend legends={legends} />
    </Box>
  );
}
