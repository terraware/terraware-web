import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Dropdown, Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import Chart, { ChartData } from 'src/components/common/Chart/Chart';
import { useOrganization } from 'src/providers';
import {
  useLazyGetStratumPlantDensityTrendQuery,
  useLazyGetStratumSurvivalRateTrendQuery,
  useLazyListStrataQuery,
} from 'src/queries/search/strata';
import strings from 'src/strings';

type PlantingSiteTrendsCardProps = {
  plantingSiteId: number;
};

export default function PlantingSiteTrendsCard({ plantingSiteId }: PlantingSiteTrendsCardProps): JSX.Element {
  const theme = useTheme();
  const { isDesktop, isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();

  const [selectedPlantsPerHaStratum, setSelectedPlantsPerHaStratum] = useState<number>();
  const [selectedSurvivalStratum, setSelectedSurvivalStratum] = useState<number>();

  const [listStrata, listStrataResponse] = useLazyListStrataQuery();
  const [getPlantDensityTrend, plantDensityTrendResponse] = useLazyGetStratumPlantDensityTrendQuery();
  const [getSurvivalRateTrend, survivalRateTrendResponse] = useLazyGetStratumSurvivalRateTrendQuery();

  useEffect(() => {
    if (selectedOrganization?.id && plantingSiteId) {
      void listStrata({ organizationId: selectedOrganization.id, plantingSiteId }, true);
    }
  }, [listStrata, plantingSiteId, selectedOrganization?.id]);

  const strataOptions = useMemo(
    () => listStrataResponse.currentData?.map((stratum) => ({ label: stratum.name, value: stratum.id })),
    [listStrataResponse.currentData]
  );

  const activePlantsPerHaStratum = selectedPlantsPerHaStratum ?? strataOptions?.[0]?.value;
  const activeSurvivalStratum = selectedSurvivalStratum ?? strataOptions?.[0]?.value;

  useEffect(() => {
    if (activePlantsPerHaStratum !== undefined) {
      void getPlantDensityTrend(activePlantsPerHaStratum, true);
    }
  }, [activePlantsPerHaStratum, getPlantDensityTrend]);

  useEffect(() => {
    if (activeSurvivalStratum !== undefined) {
      void getSurvivalRateTrend(activeSurvivalStratum, true);
    }
  }, [activeSurvivalStratum, getSurvivalRateTrend]);

  const plantsChartData: ChartData = useMemo(() => {
    const rows = plantDensityTrendResponse.currentData ?? [];
    const labels = rows.map((row) => row.completedTime);
    const values = rows.map((row) => row.plantDensity);
    const minValues = rows.map((row) => row.plantDensity - row.plantDensityStdDev);
    const maxValues = rows.map((row) => row.plantDensity + row.plantDensityStdDev);

    return {
      labels,
      datasets: [
        {
          values: minValues,
          label: strings.STANDARD_DEVIATION,
          pointRadius: 0,
          borderWidth: 0,
        },
        {
          values: maxValues,
          pointRadius: 0,
          borderWidth: 0,
          fill: {
            target: 0,
            above: '#B8A0D64D',
          },
        },
        {
          values,
          label: strings.ACTUAL,
          pointRadius: values.length === 1 ? 4 : 0,
          color: '#B8A0D6',
        },
      ],
    };
  }, [plantDensityTrendResponse.currentData]);

  const survivalChartData: ChartData = useMemo(() => {
    const rows = survivalRateTrendResponse.currentData ?? [];
    const labels = rows.map((row) => row.completedTime);
    const values = rows.map((row) => row.survivalRate);

    return {
      labels,
      datasets: [
        {
          values,
          label: strings.ACTUAL,
          pointRadius: values.length === 1 ? 4 : 0,
          color: '#D29AB4',
        },
      ],
    };
  }, [survivalRateTrendResponse.currentData]);

  const isBusy =
    listStrataResponse.isFetching || plantDensityTrendResponse.isFetching || survivalRateTrendResponse.isFetching;

  return (
    <Card
      busy={isBusy}
      radius='8px'
      style={{ display: 'flex', 'justify-content': 'space-between', flexDirection: isDesktop ? 'row' : 'column' }}
    >
      <Box flexBasis='100%'>
        <Box
          display={'flex'}
          flexDirection={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? 'flex-start' : 'center'}
        >
          <Box display={'flex'} alignItems={'center'}>
            <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
              {strings.PLANTS_PER_HA}
            </Typography>
            <Tooltip title={strings.PLANTS_PER_HA_TOOLTIP}>
              <Box display='flex' marginRight={1}>
                <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
              </Box>
            </Tooltip>
          </Box>
          <Dropdown
            placeholder={strings.SELECT}
            options={strataOptions}
            onChange={(newValue) => setSelectedPlantsPerHaStratum(Number(newValue))}
            selectedValue={activePlantsPerHaStratum}
          />
        </Box>
        <Box id='legend-container-th' sx={{ marginTop: 3 }} />
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
            customLegend
            customLegendContainerId='legend-container-th'
          />
        </Box>
      </Box>
      <Box
        sx={{
          width: '1px',
          height: 'auto',
          backgroundColor: theme.palette.TwClrBrdrTertiary,
          marginRight: '24px',
          marginLeft: '24px',
        }}
      />
      <Box flexBasis='100%' marginTop={isDesktop ? 0 : 4}>
        <Box
          display={'flex'}
          flexDirection={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? 'flex-start' : 'center'}
        >
          <Box display={'flex'} alignItems={'center'}>
            <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
              {strings.SURVIVAL_RATE}
            </Typography>
            <Tooltip title={strings.SURVIVAL_RATE_TREND_TOOLTIP}>
              <Box display='flex' marginRight={1}>
                <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
              </Box>
            </Tooltip>
          </Box>

          <Dropdown
            placeholder={strings.SELECT}
            options={strataOptions}
            onChange={(newValue) => setSelectedSurvivalStratum(Number(newValue))}
            selectedValue={activeSurvivalStratum}
          />
        </Box>
        <Box id='legend-container-mr' sx={{ marginTop: 3 }} />
        <Box paddingTop={2}>
          <Chart
            chartId='survivalChart'
            chartData={survivalChartData}
            maxWidth='100%'
            minHeight='100px'
            yLimits={{
              min: 0,
              max: survivalChartData.datasets[0]?.values.every((value) => (value as number) <= 100) ? 100 : undefined,
            }}
            type={'line'}
            xAxisType='time'
            lineColor='#D29AB4'
            customLegend
            customLegendContainerId='legend-container-mr'
          />
        </Box>
      </Box>
    </Card>
  );
}
