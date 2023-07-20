import React, { useEffect, useState } from 'react';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import { Box, Typography, useTheme } from '@mui/material';
import { useAppSelector } from 'src/redux/store';
import { selectSitePopulationZones } from 'src/redux/features/tracking/sitePopulationSelector';
import FormattedNumber from 'src/components/common/FormattedNumber';
import { selectPlantingSite, selectSiteReportedPlants } from 'src/redux/features/tracking/trackingSelectors';
import { getShortDate } from 'src/utils/dateFormatter';
import { useLocalization } from 'src/providers';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';

type TotalReportedPlantsCardProps = {
  plantingSiteId: number;
};

export default function TotalReportedPlantsCard({ plantingSiteId }: TotalReportedPlantsCardProps): JSX.Element {
  const theme = useTheme();
  const locale = useLocalization();
  const defaultTimeZone = useDefaultTimeZone();
  const observation = useAppSelector((state) =>
    selectLatestObservation(state, plantingSiteId, defaultTimeZone.get().id)
  );

  const populationSelector = useAppSelector((state) => selectSitePopulationZones(state));
  const [totalPlants, setTotalPlants] = useState(0);
  useEffect(() => {
    if (populationSelector) {
      const populations = populationSelector
        .flatMap((zone) => zone.plantingSubzones)
        .flatMap((sz) => sz.populations)
        .filter((pop) => pop !== undefined);
      const sum = populations.reduce((acc, pop) => +pop['totalPlants(raw)'] + acc, 0);
      setTotalPlants(sum);
    }
  }, [populationSelector]);

  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const [estimatedTotalPlants, setEstimatedTotalPlants] = useState<number | undefined>();
  useEffect(() => {
    if (observation?.plantingDensity && plantingSite?.areaHa) {
      setEstimatedTotalPlants(plantingSite.areaHa * observation.plantingDensity);
    } else {
      setEstimatedTotalPlants(undefined);
    }
  }, [plantingSite, observation]);

  const siteReportedPlants = useAppSelector((state) => selectSiteReportedPlants(state, plantingSiteId));
  const numPlantedSinceObs = siteReportedPlants?.plantsSinceLastObservation ?? 0;
  const percentDiff = estimatedTotalPlants ? (100 * numPlantedSinceObs) / estimatedTotalPlants : 0;

  const numberFontSize = (n: number): string => {
    if (n < 1000) {
      return '84px';
    } else if (n < 10000) {
      return '72px';
    } else if (n < 100000) {
      return '64px';
    } else if (n < 1000000) {
      return '48px';
    } else if (n < 10000000) {
      return '42px';
    } else {
      return '36px';
    }
  };

  return (
    <OverviewItemCard
      isEditable={false}
      contents={
        <Box display='flex' flexDirection='column'>
          <Typography fontSize='16px' fontWeight={600} marginBottom={theme.spacing(5)}>
            {observation?.completedTime
              ? strings.formatString(
                  strings.HOW_MANY_PLANTS_CARD_TITLE_W_OBS,
                  getShortDate(observation.completedTime, locale.activeLocale)
                )
              : strings.HOW_MANY_PLANTS_CARD_TITLE}
          </Typography>
          <Box display='flex' alignItems='flex-end' flexWrap='wrap' marginBottom={theme.spacing(3)}>
            {estimatedTotalPlants !== undefined ? (
              <Typography fontSize={numberFontSize(estimatedTotalPlants)} fontWeight={600} lineHeight={1}>
                <FormattedNumber value={Math.round(estimatedTotalPlants)} />
              </Typography>
            ) : (
              <Typography fontSize={numberFontSize(totalPlants)} fontWeight={600} lineHeight={1}>
                <FormattedNumber value={totalPlants} />
              </Typography>
            )}
            &nbsp;
            <Typography fontSize='24px' fontWeight={600}>
              {strings.PLANTS}
            </Typography>
          </Box>
          {estimatedTotalPlants !== undefined && (
            <>
              <Typography fontSize='12px' fontWeight={400} marginTop={theme.spacing(2)}>
                {strings.HOW_MANY_PLANTS_CARD_W_OBS_DESCRIPTION}
              </Typography>
              {numPlantedSinceObs > 0 ? (
                <Typography fontSize='12px' fontWeight={400} marginTop={theme.spacing(2)}>
                  {strings.formatString(
                    strings.HOW_MANY_PLANTS_CARD_W_OBS_DESCRIPTION_2,
                    numPlantedSinceObs,
                    Math.round(percentDiff)
                  )}
                </Typography>
              ) : null}
            </>
          )}
        </Box>
      }
    />
  );
}
