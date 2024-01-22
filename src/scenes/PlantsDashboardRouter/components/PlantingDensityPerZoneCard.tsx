import { Box, Typography, useTheme } from '@mui/material';
import { useAppSelector } from 'src/redux/store';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import React, { useEffect, useMemo, useState } from 'react';
import { truncate } from 'src/utils/text';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import BarChart from 'src/components/common/Chart/BarChart';
import { getShortDate } from 'src/utils/dateFormatter';
import { useLocalization } from 'src/providers';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';

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
        label: strings.TARGET_PLANTING_DENSITY,
        values: targets,
        color: theme.palette.TwClrBaseBlue500,
      },
    ];

    if (observation && actuals?.length && !actuals?.every((val) => val === null)) {
      datasets.push({
        label: strings.PLANTING_DENSITY,
        values: actuals,
        color: theme.palette.TwClrBaseBlue700,
      });
    }

    return {
      labels,
      datasets,
    };
  }, [observation, labels, targets, actuals, theme.palette.TwClrBaseBlue500, theme.palette.TwClrBaseBlue700]);

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(3)}>
            {observation
              ? strings.formatString(
                  strings.PLANTING_DENSITY_PER_ZONE_W_OBS_CARD_TITLE,
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
