import React, { useEffect, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';

import BarChart from 'src/components/common/Chart/BarChart';
import { ChartDataset } from 'src/components/common/Chart/Chart';
import useObservationSummaries from 'src/hooks/useObservationSummaries';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { truncate } from 'src/utils/text';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

const MAX_ZONE_NAME_LENGTH = 20;

type PlantingDensityPerZoneCardProps = {
  plantingSiteId: number;
};

export default function PlantingDensityPerZoneCard({ plantingSiteId }: PlantingDensityPerZoneCardProps): JSX.Element {
  const theme = useTheme();
  const defaultTimeZone = useDefaultTimeZone();
  const observation = useAppSelector((state) =>
    selectLatestObservation(state, plantingSiteId, defaultTimeZone.get().id)
  );
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const summaries = useObservationSummaries(plantingSiteId);
  const [labels, setLabels] = useState<string[]>();
  const [targets, setTargets] = useState<(number | null)[]>();
  const [actuals, setActuals] = useState<(number | null)[]>();
  const [tooltipTitles, setTooltipTitles] = useState<string[]>();

  useEffect(() => {
    if (plantingSite) {
      const zoneDensities: Record<string, (number | null)[]> = {};
      plantingSite.plantingZones?.forEach((zone) => {
        zoneDensities[zone.name] = [zone.targetPlantingDensity];

        if (summaries && summaries.length > 0) {
          const zoneFromObs = summaries[0].plantingZones.find((obsZone) => obsZone.plantingZoneId === zone.id);
          zoneDensities[zone.name].push(zoneFromObs?.plantingDensity ?? null);
        }
      });
      setLabels(Object.keys(zoneDensities).map((name) => truncate(name, MAX_ZONE_NAME_LENGTH)));
      setTargets(Object.values(zoneDensities).map((t) => t[0]));
      setActuals(Object.values(zoneDensities).map((t) => t[1]));
      setTooltipTitles(Object.keys(zoneDensities));
    } else {
      setLabels([]);
      setTargets([]);
      setActuals([]);
      setTooltipTitles([]);
    }
  }, [plantingSite, observation, summaries]);

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
  }, [actuals, labels, targets]);

  return (
    <Box>
      <Box id='legend-container-density' sx={{ marginTop: 3, marginBottom: 2 }} />
      <Box marginBottom={theme.spacing(1.5)}>
        <BarChart
          showLegend={true}
          elementColor={theme.palette.TwClrBgBrand}
          barWidth={actuals && actuals?.length ? 0 : undefined}
          chartId='plantingDensityByZone'
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
          customTooltipLabel={(tooltipItem) => {
            const v = tooltipItem.dataset.data[tooltipItem.dataIndex];
            return Array.isArray(v) ? v[0].toString() : v ? v.toString() : '';
          }}
          customLegend
          customLegendContainerId='legend-container-density'
        />
      </Box>
    </Box>
  );
}
