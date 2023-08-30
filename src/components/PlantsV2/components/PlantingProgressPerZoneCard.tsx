import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import BarChart from 'src/components/common/Chart/BarChart';
import React, { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from 'src/redux/store';
import { selectZoneProgress } from 'src/redux/features/tracking/trackingSelectors';
import { truncate } from 'src/utils/text';

const MAX_ZONE_NAME_LENGTH = 20;

type PlantingProgressPerZoneCardProps = {
  plantingSiteId: number;
};

export default function PlantingProgressPerZoneCard({ plantingSiteId }: PlantingProgressPerZoneCardProps): JSX.Element {
  const theme = useTheme();
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const [tooltipTitles, setTooltipTitles] = useState<string[]>();

  const zoneProgress = useAppSelector((state) => selectZoneProgress(state, plantingSiteId));
  useEffect(() => {
    setLabels(Object.values(zoneProgress).map((val) => truncate(val.name, MAX_ZONE_NAME_LENGTH)));
    setValues(Object.values(zoneProgress).map((val) => val.progress));
    setTooltipTitles(Object.values(zoneProgress).map((val) => val.name));
  }, [zoneProgress]);

  const chartData = useMemo(() => {
    if (!labels?.length || !values?.length) {
      return undefined;
    }

    return {
      labels: labels ?? [],
      datasets: [
        {
          values: values ?? [],
        },
      ],
    };
  }, [labels, values]);

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(3)}>
            {strings.PLANTING_PROGRESS_PER_ZONE_CARD_TITLE}
          </Typography>
          <Box marginBottom={theme.spacing(1.5)}>
            <BarChart
              elementColor={theme.palette.TwClrBgBrand}
              chartId='plantingProgressByZone'
              chartData={chartData}
              customTooltipTitles={tooltipTitles}
              maxWidth='100%'
              yLimits={{ min: 0, max: 100 }}
              yAxisLabel='%'
            />
          </Box>
          <Typography fontSize='12px' fontWeight={400} marginBottom={theme.spacing(1.5)}>
            {strings.PLANTING_PROGRESS_PER_ZONE_DESCRIPTION_1}
          </Typography>
          <Typography fontSize='12px' fontWeight={400}>
            {strings.PLANTING_PROGRESS_PER_ZONE_DESCRIPTION_2}
          </Typography>
        </Box>
      }
    />
  );
}
