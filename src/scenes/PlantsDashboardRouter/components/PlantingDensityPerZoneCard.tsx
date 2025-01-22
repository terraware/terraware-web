import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import BarChart from 'src/components/common/Chart/BarChart';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import isEnabled from 'src/features';
import { useLocalization } from 'src/providers';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { getShortDate } from 'src/utils/dateFormatter';
import { truncate } from 'src/utils/text';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

const MAX_ZONE_NAME_LENGTH = 20;

type PlantingDensityPerZoneCardProps = {
  plantingSiteId: number;
};

export default function PlantingDensityPerZoneCard({ plantingSiteId }: PlantingDensityPerZoneCardProps): JSX.Element {
  const theme = useTheme();
  const locale = useLocalization();
  const defaultTimeZone = useDefaultTimeZone();
  const observation = useAppSelector((state) =>
    selectLatestObservation(state, plantingSiteId, defaultTimeZone.get().id)
  );
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const [labels, setLabels] = useState<string[]>();
  const [targets, setTargets] = useState<(number | null)[]>();
  const [actuals, setActuals] = useState<(number | null)[]>();
  const [tooltipTitles, setTooltipTitles] = useState<string[]>();
  const newPlantsDashboardEnabled = isEnabled('New Plants Dashboard');

  useEffect(() => {
    if (plantingSite) {
      const zoneDensities: Record<string, (number | null)[]> = {};
      plantingSite.plantingZones?.forEach((zone) => {
        zoneDensities[zone.name] = [zone.targetPlantingDensity];
        if (observation) {
          const zoneFromObs = observation.plantingZones.find((obsZone) => obsZone.plantingZoneId === zone.id);
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
  }, [plantingSite, observation]);

  const chartData = useMemo(() => {
    if (!labels?.length || !targets?.length) {
      return undefined;
    }

    const datasets = [
      {
        label: newPlantsDashboardEnabled ? strings.TARGET_DENSITY : strings.TARGET_PLANTING_DENSITY,
        values: newPlantsDashboardEnabled ? targets.map((v) => [v, v] as [number, number]) : targets,
        color: newPlantsDashboardEnabled ? theme.palette.TwClrBaseBlack : theme.palette.TwClrBaseBlue500,
        minBarLength: newPlantsDashboardEnabled ? 1 : undefined,
        xAxisID: newPlantsDashboardEnabled ? 'xAxisTarget' : undefined,
      },
    ];

    if (observation && actuals?.length && !actuals?.every((val) => val === null)) {
      datasets.unshift({
        label: newPlantsDashboardEnabled ? strings.OBSERVED_DENSITY : strings.PLANTING_DENSITY,
        values: actuals,
        color: newPlantsDashboardEnabled ? theme.palette.TwClrBaseLightGreen200 : theme.palette.TwClrBaseBlue700,
        xAxisID: newPlantsDashboardEnabled ? 'xAxisActual' : undefined,
        minBarLength: newPlantsDashboardEnabled ? 1 : undefined,
      });
    }

    return {
      labels,
      datasets,
    };
  }, [observation, labels, targets, actuals, theme.palette.TwClrBaseBlue500, theme.palette.TwClrBaseBlue700]);

  return newPlantsDashboardEnabled ? (
    <Box>
      <Box id='legend-container-density' sx={{ marginTop: 3, marginBottom: 2 }} />
      <Box marginBottom={theme.spacing(1.5)}>
        <BarChart
          showLegend={true}
          elementColor={theme.palette.TwClrBgBrand}
          barWidth={observation && actuals?.length ? 0 : undefined}
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
  ) : (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(3)}>
            {observation
              ? strings.formatString(
                  strings.PLANTING_DENSITY_PER_ZONE_W_OBS_CARD_TITLE,
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
                  getShortDate(observation?.completedTime!, locale.activeLocale)
                )
              : strings.PLANTING_DENSITY_PER_ZONE_CARD_TITLE}
          </Typography>
          <Box marginBottom={theme.spacing(1.5)}>
            <BarChart
              showLegend={!!observation}
              elementColor={theme.palette.TwClrBgBrand}
              barWidth={observation && actuals?.length ? 0 : undefined}
              chartId='plantingDensityByZone'
              chartData={chartData}
              customTooltipTitles={tooltipTitles}
              maxWidth='100%'
              yAxisLabel={strings.PLANTS_PER_HECTARE}
            />
          </Box>
          <Typography fontSize='12px' fontWeight={400}>
            {strings.PLANTING_DENSITY_PER_ZONE_DESCRIPTION}
          </Typography>
        </Box>
      }
    />
  );
}
