import React, { useEffect, useState } from 'react';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import { Box, Typography, useTheme } from '@mui/material';
import { useAppSelector } from 'src/redux/store';
import { selectSitePopulation } from 'src/redux/features/tracking/sitePopulationSelector';

type TotalReportedPlantsCardProps = {
  plantingSiteId?: number;
};

export default function TotalReportedPlantsCard({ plantingSiteId }: TotalReportedPlantsCardProps): JSX.Element {
  const theme = useTheme();
  const populationSelector = useAppSelector((state) => selectSitePopulation(state));
  const [totalPlants, setTotalPlants] = useState(0);
  useEffect(() => {
    if (populationSelector) {
      const sum =
        populationSelector?.reduce((acc1, zone) => {
          const sum1 = Number(
            zone.plantingSubzones?.reduce((acc2, sz) => {
              const sum2 = Number(
                sz.populations?.reduce((acc3, pop) => {
                  return acc3 + pop.totalPlants;
                }, 0)
              );
              return acc2 + (isNaN(sum2) ? 0 : sum2);
            }, 0)
          );
          return acc1 + (isNaN(sum1) ? 0 : sum1);
        }, 0) ?? 0;
      setTotalPlants(sum);
    }
  }, [populationSelector]);

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
            {strings.HOW_MANY_PLANTS_CARD_TITLE}
          </Typography>
          <Box display='flex' alignItems='flex-end' flexWrap='wrap' marginBottom={theme.spacing(3)}>
            <Typography fontSize={numberFontSize(totalPlants)} fontWeight={600} lineHeight={1}>
              {totalPlants}
            </Typography>
            &nbsp;
            <Typography fontSize='24px' fontWeight={600}>
              {strings.PLANTS}
            </Typography>
          </Box>
        </Box>
      }
    />
  );
}
