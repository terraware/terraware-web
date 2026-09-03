import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { ChartTypeRegistry, TooltipItem } from 'chart.js';

import BarChart from 'src/components/common/Chart/BarChart';
import { ChartDataset } from 'src/components/common/Chart/Chart';
import { useLatestSiteObservationResult } from 'src/hooks/observations';
import usePlantingSite from 'src/hooks/usePlantingSite';
import strings from 'src/strings';
import { truncate } from 'src/utils/text';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

const MAX_STRATUM_NAME_LENGTH = 20;

type PlantingDensityPerStratumCardProps = {
  plantingSiteId: number;
};

export default function PlantingDensityPerStratumCard({
  plantingSiteId,
}: PlantingDensityPerStratumCardProps): JSX.Element {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const { plantingSite } = usePlantingSite(plantingSiteId);

  const { observation: latestObservationResult } = useLatestSiteObservationResult(plantingSiteId, 'Stratum');

  const tooltipRenderer = useCallback(
    (tooltipItem: TooltipItem<keyof ChartTypeRegistry>) => {
      const value = tooltipItem.dataset.data[tooltipItem.dataIndex];

      // if value is null, undefined, or an empty array, return an empty string
      if (value === null || value === undefined || (Array.isArray(value) && !value.length)) {
        return '';
      }

      const rawValue = Array.isArray(value) ? value[0] : value;
      if (rawValue === null || rawValue === undefined) {
        return '-';
      }

      const numValue = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue) || '0');
      if (!Number.isFinite(numValue)) {
        return '-';
      }

      const formattedValue = numberFormatter.format(numValue);
      return tooltipItem.dataset.label ? `${tooltipItem.dataset.label}: ${formattedValue}` : formattedValue;
    },
    [numberFormatter]
  );

  const { labels, targets, actuals, tooltipTitles } = useMemo(() => {
    if (plantingSite) {
      const stratumDensities: Record<string, (number | null)[]> = {};
      plantingSite.strata?.forEach((stratum) => {
        stratumDensities[stratum.name] = [stratum.targetPlantDensity ?? null];

        if (latestObservationResult) {
          const stratumFromObs = latestObservationResult.strata.find(
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
  }, [plantingSite, latestObservationResult]);

  const chartData = useMemo(() => {
    if (!labels?.length || !targets?.length) {
      return undefined;
    }

    const datasets: ChartDataset[] = [
      {
        label: strings.TARGET_DENSITY,
        values: targets.map((value) => (value === null ? null : [value, value])),
        color: theme.palette.TwClrBaseBlack,
        minBarLength: 1,
        order: 0,
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
        order: 1,
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
          pluginsOptions={{
            legend: {
              labels: {
                sort: (a, b) => (a.datasetIndex ?? 0) - (b.datasetIndex ?? 0),
              },
            },
          }}
        />
      </Box>
    </Box>
  );
}
