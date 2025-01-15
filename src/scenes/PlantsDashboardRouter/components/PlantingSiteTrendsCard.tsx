import { useEffect, useMemo, useState } from 'react';

import React, { Box, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Icon, Tooltip } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import Chart, { ChartData } from 'src/components/common/Chart/Chart';
import { selectPlantingSiteObservationsSummaries } from 'src/redux/features/observations/observationsSelectors';
import { requestGetPlantingSiteObservationsSummaries } from 'src/redux/features/observations/observationsThunks';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ObservationSummary } from 'src/types/Observations';

type PlantingSiteTrendsCardProps = {
  plantingSiteId: number;
};

export default function PlantingSiteTrendsCard({ plantingSiteId }: PlantingSiteTrendsCardProps): JSX.Element {
  const theme = useTheme();
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const [requestId, setRequestId] = useState<string>('');
  const plantingObservationsSummaryResponse = useAppSelector((state) =>
    selectPlantingSiteObservationsSummaries(state, requestId)
  );

  const [zonesOptions, setZoneOptions] = useState<DropdownItem[]>();
  const [selectedPlantsPerHaZone, setSelectedPlantsPerHaZone] = useState<number>();
  const [selectedMortalityZone, setSelectedMortalityZone] = useState<number>();
  const dispatch = useAppDispatch();
  const [summaries, setSummaries] = useState<ObservationSummary[]>();

  useEffect(() => {
    if (plantingSite?.id) {
      const request = dispatch(requestGetPlantingSiteObservationsSummaries(plantingSite.id));
      setRequestId(request.requestId);
    }
  }, [plantingSite]);

  useEffect(() => {
    const zoneOpts = plantingSite?.plantingZones?.map((pzone) => ({ label: pzone.name, value: pzone.id }));
    if (zoneOpts) {
      setZoneOptions(zoneOpts);
      setSelectedPlantsPerHaZone(zoneOpts[0].value);
      setSelectedMortalityZone(zoneOpts[0].value);
    }
  }, [plantingSite]);

  useEffect(() => {
    if (plantingObservationsSummaryResponse?.status === 'success') {
      setSummaries(plantingObservationsSummaryResponse.data);
    }
  }, [plantingObservationsSummaryResponse]);

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
          values: values ?? [],
        },
        {
          values: minValues ?? [],
          pointRadius: 0,
          borderWidth: 0,
        },
        {
          values: maxValues ?? [],
          pointRadius: 0,
          borderWidth: 0,
          fill: {
            target: 1, // fill to dataset 1
            above: '#B8A0D64D',
          },
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
        },
      ],
    };
  }, [summaries, selectedMortalityZone]);

  return (
    <Card radius='8px' style={{ display: 'flex', 'justify-content': 'space-between' }}>
      <Box flexBasis='100%'>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.PLANTS_PER_HA}
          </Typography>
          <Tooltip title={strings.PLANTS_PER_HA_TOOLTIP}>
            <Box display='flex' marginRight={1}>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>
          <Dropdown
            placeholder={strings.SELECT}
            options={zonesOptions}
            onChange={(newValue) => setSelectedPlantsPerHaZone(Number(newValue))}
            selectedValue={selectedPlantsPerHaZone}
          />
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
      <Box
        sx={{
          width: '1px',
          height: 'auto',
          backgroundColor: theme.palette.TwClrBrdrTertiary,
          marginRight: '24px',
          marginLeft: '24px',
        }}
      />
      <Box flexBasis='100%'>
        <Box display={'flex'} alignItems={'center'}>
          <Typography fontSize={'20px'} fontWeight={600} marginRight={1}>
            {strings.MORTALITY_RATE}
          </Typography>
          <Tooltip title={strings.MORTALITY_RATE_TREND_TOOLTIP}>
            <Box display='flex' marginRight={1}>
              <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
            </Box>
          </Tooltip>

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
