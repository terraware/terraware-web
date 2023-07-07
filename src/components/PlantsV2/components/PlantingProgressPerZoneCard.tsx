import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import BarChart from 'src/components/common/Chart/BarChart';
import React, { useEffect, useState } from 'react';
import { useAppSelector } from 'src/redux/store';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { truncate } from 'src/utils/text';

const MAX_ZONE_NAME_LENGTH = 20;

type PlantingProgressPerZoneCardProps = {
  plantingSiteId: number;
};

export default function PlantingProgressPerZoneCard({ plantingSiteId }: PlantingProgressPerZoneCardProps): JSX.Element {
  const theme = useTheme();
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const [labels, setLabels] = useState<string[]>();
  const [values, setValues] = useState<number[]>();
  const [tooltipTitles, setTooltipTitles] = useState<string[]>();

  useEffect(() => {
    if (plantingSite) {
      const zoneProgress: Record<string, number> = {};
      plantingSite.plantingZones?.forEach((zone) => {
        let completedPlantingArea = 0;
        zone.plantingSubzones.forEach((sz) => {
          completedPlantingArea += sz.plantingCompleted ? +sz.areaHa : 0;
        });
        const percentProgress = Math.round((100 * completedPlantingArea) / +zone.areaHa);
        zoneProgress[zone.name] = percentProgress;
      });
      setLabels(Object.keys(zoneProgress).map((name) => truncate(name, MAX_ZONE_NAME_LENGTH)));
      setValues(Object.values(zoneProgress));
      setTooltipTitles(Object.keys(zoneProgress));
    } else {
      setLabels([]);
      setValues([]);
      setTooltipTitles([]);
    }
  }, [plantingSite]);

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
              chartData={{
                labels: labels ?? [],
                datasets: [
                  {
                    values: values ?? [],
                  },
                ],
              }}
              customTooltipTitles={tooltipTitles}
              maxWidth='100%'
              yLimits={{ min: 0, max: 100 }}
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
