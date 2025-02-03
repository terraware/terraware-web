import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Icon, Tooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import Chart, { ChartData } from 'src/components/common/Chart/Chart';
import useObservationSummaries from 'src/hooks/useObservationSummaries';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

type PlantingSiteTrendsCardProps = {
  plantingSiteId: number;
};

export default function PlantingSiteTrendsCard({ plantingSiteId }: PlantingSiteTrendsCardProps): JSX.Element {
  const theme = useTheme();
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const [zonesOptions, setZoneOptions] = useState<DropdownItem[]>();
  const [selectedPlantsPerHaZone, setSelectedPlantsPerHaZone] = useState<number>();
  const [selectedMortalityZone, setSelectedMortalityZone] = useState<number>();
  const summaries = useObservationSummaries(plantingSiteId);
  const { isDesktop, isMobile } = useDeviceInfo();

  useEffect(() => {
    const zoneOpts = plantingSite?.plantingZones?.map((pzone) => ({ label: pzone.name, value: pzone.id }));
    if (zoneOpts) {
      setZoneOptions(zoneOpts);
      setSelectedPlantsPerHaZone(zoneOpts[0].value);
      setSelectedMortalityZone(zoneOpts[0].value);
    }
  }, [plantingSite]);

  const plantsChartData: ChartData = useMemo(() => {
    const filteredSummaries = summaries?.filter((sc) => {
      const zone = sc.plantingZones.find((pz) => pz.plantingZoneId === selectedPlantsPerHaZone);
      if (zone?.plantingDensity !== undefined) {
        return true;
      }
    });
    const labels = filteredSummaries?.map((sm) => sm.latestObservationTime);
    const values = filteredSummaries?.map((sm) => {
      const zone = sm.plantingZones.find((pz) => pz.plantingZoneId === selectedPlantsPerHaZone);
      return zone?.plantingDensity || 0;
    });

    const minValues = filteredSummaries?.map((sm) => {
      const zone = sm.plantingZones.find((pz) => pz.plantingZoneId === selectedPlantsPerHaZone);
      return (zone?.plantingDensity || 0) - (zone?.plantingDensityStdDev || 0);
    });

    const maxValues = filteredSummaries?.map((sm) => {
      const zone = sm.plantingZones.find((pz) => pz.plantingZoneId === selectedPlantsPerHaZone);
      return (zone?.plantingDensity || 0) + (zone?.plantingDensityStdDev || 0);
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
  }, [summaries, selectedPlantsPerHaZone]);

  const mortalityChartData: ChartData = useMemo(() => {
    const filteredSummaries = summaries?.filter((sc) => {
      const zone = sc.plantingZones.find((pz) => pz.plantingZoneId === selectedPlantsPerHaZone);
      if (zone?.mortalityRate !== undefined) {
        return true;
      }
    });
    const labels = filteredSummaries?.map((sm) => sm.latestObservationTime);
    const values = filteredSummaries?.map((sm) => {
      const zone = sm.plantingZones.find((pz) => pz.plantingZoneId === selectedMortalityZone);
      return zone?.mortalityRate || 0;
    });

    return {
      labels: labels ?? [],
      datasets: [
        {
          values: values ?? [],
          pointRadius: values?.length === 1 ? 4 : 0,
          color: '#D29AB4',
        },
      ],
    };
  }, [summaries, selectedMortalityZone]);

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
            options={zonesOptions}
            onChange={(newValue) => setSelectedPlantsPerHaZone(Number(newValue))}
            selectedValue={selectedPlantsPerHaZone}
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
              {strings.MORTALITY_RATE}
            </Typography>
            <Tooltip title={strings.MORTALITY_RATE_TREND_TOOLTIP}>
              <Box display='flex' marginRight={1}>
                <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
              </Box>
            </Tooltip>
          </Box>

          <Dropdown
            placeholder={strings.SELECT}
            options={zonesOptions}
            onChange={(newValue) => setSelectedMortalityZone(Number(newValue))}
            selectedValue={selectedMortalityZone}
          />
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
