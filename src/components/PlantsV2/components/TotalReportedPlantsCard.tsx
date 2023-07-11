import React, { useEffect, useState } from 'react';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import strings from 'src/strings';
import { Box, Typography, useTheme } from '@mui/material';
import { useAppSelector } from 'src/redux/store';
import { selectSitePopulation } from 'src/redux/features/tracking/sitePopulationSelector';
import { NumericFormatter } from 'src/types/Number';

type TotalReportedPlantsCardProps = {
  plantingSiteId?: number;
  numericFormater: NumericFormatter;
};

export default function TotalReportedPlantsCard({
  plantingSiteId,
  numericFormater,
}: TotalReportedPlantsCardProps): JSX.Element {
  const theme = useTheme();
  const populationSelector = useAppSelector((state) => selectSitePopulation(state));
  const [totalPlants, setTotalPlants] = useState(0);
  useEffect(() => {
    if (populationSelector) {
      const populations = populationSelector
        .flatMap((zone) => zone.plantingSubzones)
        .flatMap((sz) => sz.populations)
        .filter((pop) => pop !== undefined);
      const sum = populations.reduce((acc, pop) => +pop.totalPlants + acc, 0);
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
              {totalPlants ? numericFormater.format(totalPlants) : ''}
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
