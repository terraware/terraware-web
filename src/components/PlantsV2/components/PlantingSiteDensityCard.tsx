import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import React from 'react';
import { useAppSelector } from 'src/redux/store';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { ObservationResults } from 'src/types/Observations';
import { getShortDate } from 'src/utils/dateFormatter';
import { useLocalization } from 'src/providers';
import ProgressChart from 'src/components/common/Chart/ProgressChart';
import { selectPlantingsDateRange } from 'src/redux/features/Plantings/plantingsSelectors';

type PlantingSiteDensityCardProps = {
  plantingSiteId: number;
  observation?: ObservationResults;
};

export default function PlantingSiteDensityCard({
  plantingSiteId,
  observation,
}: PlantingSiteDensityCardProps): JSX.Element {
  const theme = useTheme();
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const plantingsSinceObservation = useAppSelector((state) =>
    selectPlantingsDateRange(state, observation?.completedDate ? [observation?.completedDate] : [])
  );
  const locale = useLocalization();

  const weightedSum =
    plantingSite?.plantingZones?.map((z) => z.targetPlantingDensity * z.areaHa)?.reduce((a, b) => a + b) ?? 0;
  const targetPlantingDensity = plantingSite?.areaHa ? weightedSum / plantingSite.areaHa : 0;
  const plantingDensity = observation?.plantingDensity ?? 0;
  const percentageOfTargetDensity = (100 * plantingDensity) / targetPlantingDensity;
  const numPlantedSinceObs = plantingsSinceObservation.reduce((prev, curr) => +curr.numPlants + prev, 0);
  const newDensityEstimate = plantingSite?.areaHa
    ? plantingDensity + numPlantedSinceObs / plantingSite.areaHa
    : plantingDensity;

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(5)}>
            {observation?.completedTime
              ? strings.formatString(
                  strings.PLANTING_DENSITY_CARD_TITLE,
                  getShortDate(observation.completedTime, locale.activeLocale)
                )
              : ''}
          </Typography>
          <Box display={'flex'} alignItems='baseline'>
            <Typography fontSize='84px' fontWeight={600} lineHeight={1} marginBottom={theme.spacing(3)}>
              {Math.round(plantingDensity)}
            </Typography>
            <Typography fontSize='24px' fontWeight={600} lineHeight={1} marginBottom={theme.spacing(3)}>
              {strings.PLANTS_PER_HECTARE}
            </Typography>
          </Box>
          <Typography
            fontSize='20px'
            fontWeight={600}
            lineHeight={1}
            marginBottom={theme.spacing(2)}
            textAlign='center'
          >
            {strings.formatString(strings.PERCENTAGE_OF_TARGET_PLANTING_DENSITY, Math.round(percentageOfTargetDensity))}
          </Typography>
          <ProgressChart value={plantingDensity} target={targetPlantingDensity} />
          <Typography
            fontSize='16px'
            fontWeight={600}
            lineHeight={1}
            marginTop={theme.spacing(2)}
            marginBottom={theme.spacing(2)}
            textAlign='right'
            color={theme.palette.TwClrBaseBlue500}
          >
            {strings.formatString(strings.TARGET_DENSITY_PLANTS_PER_HECTARE, Math.round(targetPlantingDensity))}
          </Typography>
          <Typography fontSize='12px' fontWeight={400}>
            {strings.PLANTING_DENSITY_DESCRIPTION}
          </Typography>
          {numPlantedSinceObs > 0 && (
            <Typography fontSize='12px' fontWeight={400}>
              {strings.formatString(strings.PLANTING_DENSITY_UPDATE_DESCRIPTION, Math.round(newDensityEstimate))}
            </Typography>
          )}
        </Box>
      }
    />
  );
}
