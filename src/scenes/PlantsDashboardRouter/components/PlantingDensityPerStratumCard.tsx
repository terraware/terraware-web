import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { ChartTypeRegistry, TooltipItem } from 'chart.js';

import BarChart from 'src/components/common/Chart/BarChart';
import { ChartDataset } from 'src/components/common/Chart/Chart';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';
import { truncate } from 'src/utils/text';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

const MAX_STRATUM_NAME_LENGTH = 20;

export default function PlantingDensityPerStratumCard(): JSX.Element {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const { plantingSite, observationSummaries } = usePlantingSiteData();

  const tooltipRenderer = useCallback(
    (tooltipItem: TooltipItem<keyof ChartTypeRegistry>) => {
      const value = tooltipItem.dataset.data[tooltipItem.dataIndex];

      // if value is null, undefined, or an empty array, return an empty string
      if (value === null || value === undefined || (Array.isArray(value) && !value.length)) {
        return '';
      }

      const rawValue = Array.isArray(value) ? value[0] : value;
      const numValue = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue) || '0');

      return numberFormatter.format(numValue);
    },
    [numberFormatter]
  );

  const { labels, targets, actuals, tooltipTitles } = useMemo(() => {
    if (plantingSite) {
      const stratumDensities: Record<string, (number | null)[]> = {};
      plantingSite.strata?.forEach((stratum) => {
        stratumDensities[stratum.name] = [stratum.targetPlantingDensity];

        if (observationSummaries && observationSummaries.length > 0) {
          const stratumFromObs = observationSummaries[0].strata.find(
            (obsStratum) => obsStratum.stratumId === stratum.id
          );
          stratumDensities[stratum.name].push(stratumFromObs?.plantingDensity ?? null);
        }
      });
      return {
        labels: Object.keys(stratumDensities).map((name) => truncate(name, MAX_STRATUM_NAME_LENGTH)),
        targets: Object.values(stratumDensities).map((t) => t[0]),
        actuals: Object.values(stratumDensities).map((t) => t[1]),
        tooltipTitles: Object.keys(stratumDensities),
      };
    } else {
      return {
        labels: [] as string[],
        targets: [] as (number | null)[],
        actuals: [] as (number | null)[],
        tooltipTitles: [] as string[],
      };
    }
  }, [plantingSite, observationSummaries]);

  const chartData = useMemo(() => {
    if (!labels?.length || !targets?.length) {
      return undefined;
    }

    const datasets: ChartDataset[] = [
      {
        label: strings.TARGET_DENSITY,
        values: targets.map((v) => [v, v] as [number, number]),
        color: theme.palette.TwClrBaseBlack,
        minBarLength: 1,
        xAxisID: 'xAxisTarget',
      },
    ];

    if (actuals && actuals?.length && !actuals?.every((val) => val === null)) {
      datasets.unshift({
        label: strings.OBSERVED_DENSITY,
        values: actuals,
        color: theme.palette.TwClrBaseLightGreen200,
        xAxisID: 'xAxisActual',
        minBarLength: 1,
      });
    }

    return {
      labels,
      datasets,
    };
  }, [actuals, labels, targets, theme]);

  return (
    <Box>
      <Box id='legend-container-density' sx={{ marginTop: 3, marginBottom: 2 }} />
      <Box marginBottom={theme.spacing(1.5)}>
        <BarChart
          showLegend={true}
          elementColor={theme.palette.TwClrBgBrand}
          barWidth={actuals && actuals?.length ? 0 : undefined}
          chartId='plantingDensityByStratum'
          chartData={chartData}
          customTooltipTitles={tooltipTitles}
          maxWidth='100%'
          yAxisLabel={strings.PLANTS_PER_HECTARE}
          customScales={{
            xAxisTarget: {
              stacked: true,
            },
            xAxisActual: {
              display: false,
              offset: true,
              stacked: true,
            },
            y: { grace: '20%' },
          }}
          customLegend
          customLegendContainerId='legend-container-density'
          customTooltipLabel={tooltipRenderer}
        />
      </Box>
    </Box>
  );
}
