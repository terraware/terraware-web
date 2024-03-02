import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { useLocalization } from 'src/providers';
import { selectLatestObservation } from 'src/redux/features/observations/observationsSelectors';
import { selectSitePopulationZones } from 'src/redux/features/tracking/sitePopulationSelector';
import { selectPlantingSite, selectSiteReportedPlants } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { PlantingSite, PlantingSiteReportedPlants } from 'src/types/Tracking';
import { getShortDate } from 'src/utils/dateFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

type TotalReportedPlantsCardProps = {
  plantingSiteId: number;
};

export default function TotalReportedPlantsCard({ plantingSiteId }: TotalReportedPlantsCardProps): JSX.Element {
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const siteReportedPlants = useAppSelector((state) => selectSiteReportedPlants(state, plantingSiteId));

  if (!plantingSite?.plantingZones?.length) {
    return <SiteWithoutZonesCard siteReportedPlants={siteReportedPlants} />;
  } else {
    return (
      <SiteWithZonesCard
        siteReportedPlants={siteReportedPlants}
        plantingSiteId={plantingSiteId}
        plantingSite={plantingSite}
      />
    );
  }
}

type SiteWithoutZonesCardProps = {
  siteReportedPlants?: PlantingSiteReportedPlants;
};

const SiteWithoutZonesCard = ({ siteReportedPlants }: SiteWithoutZonesCardProps): JSX.Element => {
  return <CardData totalPlants={siteReportedPlants?.totalPlants ?? 0} />;
};

type SiteWithZonesCardProps = {
  plantingSiteId: number;
  plantingSite?: PlantingSite;
  siteReportedPlants?: PlantingSiteReportedPlants;
};

const SiteWithZonesCard = ({
  plantingSiteId,
  plantingSite,
  siteReportedPlants,
}: SiteWithZonesCardProps): JSX.Element => {
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

  const [estimatedTotalPlants, setEstimatedTotalPlants] = useState<number | undefined>();
  useEffect(() => {
    if (observation?.plantingDensity && plantingSite?.areaHa) {
      setEstimatedTotalPlants(plantingSite.areaHa * observation.plantingDensity);
    } else {
      setEstimatedTotalPlants(undefined);
    }
  }, [plantingSite, observation]);

  const numPlantedSinceObs = siteReportedPlants?.plantsSinceLastObservation ?? 0;
  const percentDiff = estimatedTotalPlants ? (100 * numPlantedSinceObs) / estimatedTotalPlants : 0;

  const estimated = useMemo(
    () => ({
      totalPlants: estimatedTotalPlants,
      numPlantedSinceObs,
      percentDiff,
    }),
    [estimatedTotalPlants, numPlantedSinceObs, percentDiff]
  );

  return <CardData completedTime={observation?.completedTime} estimated={estimated} totalPlants={totalPlants} />;
};

type CardDataProps = {
  completedTime?: string;
  totalPlants: number;
  estimated?: {
    totalPlants?: number;
    numPlantedSinceObs: number;
    percentDiff: number;
  };
};

const CardData = ({ completedTime, estimated, totalPlants }: CardDataProps): JSX.Element => {
  const theme = useTheme();
  const locale = useLocalization();

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
            {completedTime
              ? strings.formatString(
                  strings.HOW_MANY_PLANTS_CARD_TITLE_W_OBS,
                  getShortDate(completedTime, locale.activeLocale)
                )
              : strings.HOW_MANY_PLANTS_CARD_TITLE}
          </Typography>
          <Box display='flex' alignItems='flex-end' flexWrap='wrap' marginBottom={theme.spacing(3)}>
            {estimated?.totalPlants !== undefined ? (
              <Typography fontSize={numberFontSize(estimated.totalPlants)} fontWeight={600} lineHeight={1}>
                <FormattedNumber value={Math.round(estimated.totalPlants)} />
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
          {estimated?.totalPlants !== undefined && (
            <>
              <Typography fontSize='12px' fontWeight={400} marginTop={theme.spacing(2)}>
                {strings.HOW_MANY_PLANTS_CARD_W_OBS_DESCRIPTION}
              </Typography>
              {estimated.numPlantedSinceObs > 0 ? (
                <Typography fontSize='12px' fontWeight={400} marginTop={theme.spacing(2)}>
                  {strings.formatString(
                    strings.HOW_MANY_PLANTS_CARD_W_OBS_DESCRIPTION_2,
                    estimated.numPlantedSinceObs!,
                    Math.round(estimated.percentDiff!)
                  )}
                </Typography>
              ) : null}
            </>
          )}
        </Box>
      }
    />
  );
};
