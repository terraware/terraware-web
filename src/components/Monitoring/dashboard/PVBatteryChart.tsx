import React, { useEffect, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';
import { Chart } from 'chart.js';
import 'chartjs-adapter-luxon';
import { DateTime } from 'luxon';

import { getTimeseriesHistory } from 'src/api/timeseries/timeseries';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Device } from 'src/types/Device';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumber';

import { newChart } from '../../common/Chart';
import Icon from '../../common/icon/Icon';
import {
  ChartPalette,
  HumidityValues,
  convertEntryTimestamp,
  getTimePeriodParams,
  getUnit,
  timePeriods,
} from './Common';
import { htmlLegendPlugin } from './htmlLegendPlugin';

declare global {
  interface Window {
    pvBatteryChart: any;
  }
}

type PVBatteryChartProps = {
  BMU?: Device;
  defaultTimePeriod?: string;
  updateTimePeriodPreferences: (timePeriod: string) => void;
  timeZone: string;
};

export default function PVBatteryChart(props: PVBatteryChartProps): JSX.Element {
  const { isMobile, isDesktop } = useDeviceInfo();
  const theme = useTheme();
  const { BMU, defaultTimePeriod, updateTimePeriodPreferences, timeZone } = props;
  const [selectedPVBatteryPeriod, setSelectedPVBatteryPeriod] = useState<string>();
  const { activeLocale } = useLocalization();
  const numberFormatter = useNumberFormatter();
  const numericFormatter = useMemo(() => numberFormatter(activeLocale), [activeLocale, numberFormatter]);

  useEffect(() => {
    if (defaultTimePeriod) {
      setSelectedPVBatteryPeriod(defaultTimePeriod);
    }
  }, [defaultTimePeriod]);

  useEffect(() => {
    const createBatteryChart = async (
      stateOfChargeValues: HumidityValues[],
      powerValues: HumidityValues[],
      chartReference: React.RefObject<HTMLCanvasElement>
    ) => {
      const ctx = chartReference?.current?.getContext('2d');
      if (ctx && selectedPVBatteryPeriod && activeLocale) {
        const timePeriodParams = getTimePeriodParams(selectedPVBatteryPeriod, timeZone);
        window.pvBatteryChart = await newChart(activeLocale, ctx, {
          type: 'scatter',
          data: {
            datasets: [
              {
                data: stateOfChargeValues?.map((entry) => {
                  return { x: convertEntryTimestamp(entry.timestamp, timeZone), y: Number(entry.value) };
                }),
                label: strings.MONITORING_LABEL_STATE_OF_CHARGE,
                showLine: true,
                fill: false,
                borderColor: ChartPalette.STATE_OF_CHARGE.borderColor,
                backgroundColor: ChartPalette.STATE_OF_CHARGE.backgroundColor,
              },
              {
                data: powerValues?.map((entry) => {
                  return { x: convertEntryTimestamp(entry.timestamp, timeZone), y: Number(entry.value) };
                }),
                label: strings.MONITORING_LABEL_SYSTEM_POWER,
                showLine: true,
                fill: false,
                borderColor: ChartPalette.SYSTEM_POWER.borderColor,
                backgroundColor: ChartPalette.SYSTEM_POWER.backgroundColor,
                yAxisID: 'y1',
              },
            ],
          },
          options: {
            scales: {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              y: {
                ticks: {
                  callback: (value) => {
                    return strings.formatString(strings.PERCENTAGE_VALUE, value) as string;
                  },
                },
              },
              x: {
                type: 'time',
                time: {
                  unit: getUnit(selectedPVBatteryPeriod),
                  displayFormats: {
                    hour: strings.MONITORING_DATE_FORMAT,
                  },
                },
                max:
                  stateOfChargeValues?.length < timePeriodParams.numDataPoints
                    ? timePeriodParams.end.valueOf()
                    : undefined,
                min:
                  stateOfChargeValues?.length < timePeriodParams.numDataPoints
                    ? timePeriodParams.start.valueOf()
                    : undefined,
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                // grid line settings
                grid: {
                  drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
                ticks: {
                  callback: (value) => {
                    return strings.formatString(strings.WATTS_VALUE, numericFormatter.format(value)) as string;
                  },
                },
              },
            },
            plugins: {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              htmlLegend: {
                containerID: 'legend-container-pvbattery',
              },
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    let label = '';

                    if (context.parsed.x !== null) {
                      label += DateTime.fromMillis(context.parsed.x).toFormat('yyyy-MM-ddTHH:mm');
                    }
                    if (context.parsed.y !== null) {
                      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                      label += ', ' + context.parsed.y;
                    }
                    return label;
                  },
                },
              },
            },
          },
          plugins: [htmlLegendPlugin],
        });
      }
    };

    const getChartData = async () => {
      if (selectedPVBatteryPeriod) {
        const timePeriodParams = getTimePeriodParams(selectedPVBatteryPeriod, timeZone);
        const startTime = timePeriodParams.start;
        const endTime = timePeriodParams.end;
        if (BMU && startTime.isValid && endTime.isValid) {
          const response = await getTimeseriesHistory(
            startTime.toISO(),
            endTime.toISO(),
            [
              { deviceId: BMU.id, timeseriesName: 'relative_state_of_charge' },
              { deviceId: BMU.id, timeseriesName: 'system_power' },
            ],
            timePeriodParams.numDataPoints
          );

          if (response.requestSucceeded) {
            if (window.pvBatteryChart instanceof Chart) {
              window.pvBatteryChart.destroy();
            }
            await createBatteryChart(response.values[0]?.values, response.values[1]?.values, pvBatteryRef);
          }
        }
      }
    };
    if (selectedPVBatteryPeriod) {
      getChartData();
    }
  }, [BMU, activeLocale, numericFormatter, selectedPVBatteryPeriod, timeZone]);

  const onChangePVBatterySelectedPeriod = (newValue: string) => {
    setSelectedPVBatteryPeriod(newValue);
    updateTimePeriodPreferences(newValue);
  };

  const pvBatteryRef = React.useRef<HTMLCanvasElement>(null);

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBg,
        borderRadius: '24px',
        padding: '24px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          margin: theme.spacing(0, 0, 3, 1),
        }}
      >
        <Icon name='futures' size='medium' style={{ fill: theme.palette.TwClrIcnSecondary }} />
        <p
          style={{
            fontWeight: 600,
            fontSize: '20px',
            margin: theme.spacing(0, 1),
          }}
        >
          {strings.PV_BATTERY}
        </p>
      </Box>
      <Box sx={{ display: 'flex' }}>
        <Dropdown
          options={timePeriods()}
          onChange={onChangePVBatterySelectedPeriod}
          selectedValue={selectedPVBatteryPeriod}
          label={strings.TIME_PERIOD}
        />
      </Box>
      <Box sx={{ marginTop: '40px' }}>
        <Box
          id='legend-container-pvbattery'
          sx={{
            marginBottom: '32px',
            padding: isMobile ? 0 : '0 78px 0 41px',
            '& ul': {
              display: isMobile ? 'block' : 'flex',
              '& li': {
                marginLeft: isMobile ? 0 : '10px',
              },
            },
          }}
        />
        <Box
          sx={{
            position: 'relative',
            width: isDesktop ? 'calc(100vw - 300px)' : 'calc(100vw - 136px)',
            paddingRight: theme.spacing(4),
          }}
        >
          <canvas id='pvBatteryChart' ref={pvBatteryRef} />
        </Box>
      </Box>
    </Box>
  );
}
