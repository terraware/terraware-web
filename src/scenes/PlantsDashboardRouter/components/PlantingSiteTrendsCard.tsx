import { useMemo } from 'react';

import React, { Box, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import Chart from 'src/components/common/Chart/Chart';
import { selectObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

type PlantingSiteTrendsCardProps = {
  plantingSiteId: number;
};

export default function PlantingSiteTrendsCard({ plantingSiteId }: PlantingSiteTrendsCardProps): JSX.Element {
  const theme = useTheme();
  const allObservationsResults = useAppSelector(selectObservationsResults);
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));

  const totalArea = plantingSite?.areaHa ?? 1;

  const siteObservations = useMemo(() => {
    if (!allObservationsResults || !plantingSiteId) {
      return [];
    }
    return allObservationsResults?.filter((observationResult) => {
      const matchesSite = observationResult.plantingSiteId === plantingSiteId;
      return matchesSite;
    });
  }, [allObservationsResults, plantingSiteId]);

  const sortedObservations = useMemo(
    () => siteObservations.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
    [siteObservations]
  );

  const separatorStyles = {
    width: '1px',
    height: 'auto',
    backgroundColor: theme.palette.TwClrBrdrTertiary,
    marginRight: '24px',
    marginLeft: '24px',
  };

  const plantsChartData = useMemo(() => {
    const labels = sortedObservations.map((ob) => ob.startDate);
    const values = sortedObservations.map(
      (ob) => ob.plantingZones.flatMap((zone) => zone.totalPlants).reduce((acc, curr) => acc + curr, 0) / totalArea
    );

    return {
      labels: labels ?? [],
      datasets: [
        {
          values: values ?? [],
        },
      ],
    };
  }, [sortedObservations]);

  const mortalityChartData = useMemo(() => {
    const labels = sortedObservations.map((ob) => ob.startDate);
    const values = sortedObservations.map((ob) => ob.mortalityRate);

    return {
      labels: labels ?? [],
      datasets: [
        {
          values: values ?? [],
        },
      ],
    };
  }, [sortedObservations]);

  return (
    <Card radius='8px' style={{ display: 'flex', 'justify-content': 'space-between' }}>
      <Box flexBasis='100%'>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.PLANTS_PER_HA}
          </Typography>
          <Tooltip title={strings.PLANTS_PER_HA_TOOLTIP}>
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
        </Box>
        <Box marginTop={2}>
          <Chart
            chartId='plantsPerHaChart'
            chartData={plantsChartData}
            maxWidth='100%'
            minHeight='100px'
            yLimits={{ min: 0 }}
            type={'line'}
            xAxisType='time'
            lineColor='#B8A0D6'
          />
        </Box>
      </Box>
      <div style={separatorStyles} />
      <Box flexBasis='100%'>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.MORTALITY_RATE}
          </Typography>
          <Tooltip title={strings.MORTALITY_RATE_TREND_TOOLTIP}>
            <Box display='flex'>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
        </Box>
        <Box paddingTop={2}>
          <Chart
            chartId='mortalityChart'
            chartData={mortalityChartData}
            maxWidth='100%'
            minHeight='100px'
            yLimits={{ min: 0, max: 100 }}
            type={'line'}
            xAxisType='time'
            lineColor='#D29AB4'
          />
        </Box>
      </Box>
    </Card>
  );
}
