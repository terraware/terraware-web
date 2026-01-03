import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import Chart, { ChartData } from 'src/components/common/Chart/Chart';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import strings from 'src/strings';

export default function PlantingSiteTrendsCard(): JSX.Element {
  const theme = useTheme();
  const [strataOptions, setStrataOptions] = useState<DropdownItem[]>();
  const [selectedPlantsPerHaStratum, setSelectedPlantsPerHaStratum] = useState<number>();
  const [selectedSurvivalStratum, setSelectedSurvivalStratum] = useState<number>();
  const { plantingSite, observationSummaries } = usePlantingSiteData();
  const { isDesktop, isMobile } = useDeviceInfo();

  useEffect(() => {
    const stratumOpts = plantingSite?.strata?.map((_stratum) => ({ label: _stratum.name, value: _stratum.id }));
    if (stratumOpts) {
      setStrataOptions(stratumOpts);
      setSelectedPlantsPerHaStratum(stratumOpts[0].value);
      setSelectedSurvivalStratum(stratumOpts[0].value);
    }
  }, [plantingSite]);

  const plantsChartData: ChartData = useMemo(() => {
    const filteredSummaries = observationSummaries?.filter((sc) => {
      const stratum = sc.strata.find((_stratum) => _stratum.stratumId === selectedPlantsPerHaStratum);
      if (stratum?.plantingDensity !== undefined) {
        return true;
      }
    });
    const labels = filteredSummaries?.map((sm) => sm.latestObservationTime);
    const values = filteredSummaries?.map((sm) => {
      const stratum = sm.strata.find((_stratum) => _stratum.stratumId === selectedPlantsPerHaStratum);
      return stratum?.plantingDensity || 0;
    });

    const minValues = filteredSummaries?.map((sm) => {
      const stratum = sm.strata.find((_stratum) => _stratum.stratumId === selectedPlantsPerHaStratum);
      return (stratum?.plantingDensity || 0) - (stratum?.plantingDensityStdDev || 0);
    });

    const maxValues = filteredSummaries?.map((sm) => {
      const stratum = sm.strata.find((_stratum) => _stratum.stratumId === selectedPlantsPerHaStratum);
      return (stratum?.plantingDensity || 0) + (stratum?.plantingDensityStdDev || 0);
    });

    return {
      labels: labels ?? [],
      datasets: [
        {
          values: minValues ?? [],
          label: strings.STANDARD_DEVIATION,
          pointRadius: 0,
          borderWidth: 0,
        },
        {
          values: maxValues ?? [],
          pointRadius: 0,
          borderWidth: 0,
          fill: {
            target: 0, // fill to dataset 0
            above: '#B8A0D64D',
          },
        },
        {
          values: values ?? [],
          label: strings.ACTUAL,
          pointRadius: values?.length === 1 ? 4 : 0,
          color: '#B8A0D6',
        },
      ],
    };
  }, [observationSummaries, selectedPlantsPerHaStratum]);

  const survivalChartData: ChartData = useMemo(() => {
    const filteredSummaries = observationSummaries?.filter((sc) => {
      const stratum = sc.strata.find((_stratum) => _stratum.stratumId === selectedPlantsPerHaStratum);
      if (stratum?.survivalRate !== undefined) {
        return true;
      }
    });
    const labels = filteredSummaries?.map((sm) => sm.latestObservationTime);
    const values = filteredSummaries?.map((sm) => {
      const stratum = sm.strata.find((_stratum) => _stratum.stratumId === selectedSurvivalStratum);
      return stratum?.survivalRate || 0;
    });

    return {
      labels: labels ?? [],
      datasets: [
        {
          values: values ?? [],
          label: strings.ACTUAL,
          pointRadius: values?.length === 1 ? 4 : 0,
          color: '#D29AB4',
        },
      ],
    };
  }, [observationSummaries, selectedPlantsPerHaStratum, selectedSurvivalStratum]);

  return (
    <Card
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
            selectedValue={selectedPlantsPerHaStratum}
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
            selectedValue={selectedSurvivalStratum}
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
