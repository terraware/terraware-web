import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

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
  const [labels, setLabels] = useState<string[]>();
  const [targets, setTargets] = useState<(number | null)[]>();
  const [actuals, setActuals] = useState<(number | null)[]>();
  const [tooltipTitles, setTooltipTitles] = useState<string[]>();

  const tooltipRenderer = useCallback(
    (tooltipItem: TooltipItem<keyof ChartTypeRegistry>) => {
      const v = tooltipItem.dataset.data[tooltipItem.dataIndex];
      if (Array.isArray(v)) {
        const numValue = typeof v[0] === 'number' ? v[0] : parseFloat(String(v[0]) || '0');
        return numberFormatter.format(numValue);
      } else if (v !== null && v !== undefined) {
        const numValue = typeof v === 'number' ? v : parseFloat(String(v) || '0');
        return numberFormatter.format(numValue);
      }
      return '';
    },
    [numberFormatter]
  );

  useEffect(() => {
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
      setLabels(Object.keys(stratumDensities).map((name) => truncate(name, MAX_STRATUM_NAME_LENGTH)));
      setTargets(Object.values(stratumDensities).map((t) => t[0]));
      setActuals(Object.values(stratumDensities).map((t) => t[1]));
      setTooltipTitles(Object.keys(stratumDensities));
    } else {
      setLabels([]);
      setTargets([]);
      setActuals([]);
      setTooltipTitles([]);
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
