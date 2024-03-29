import React, { useEffect, useMemo, useState } from 'react';

import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dropdown } from '@terraware/web-components';
import { Chart } from 'chart.js';
import 'chartjs-adapter-date-fns';
import moment from 'moment';

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

interface StyleProps {
  isMobile: boolean;
  isDesktop: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  graphContainer: {
    backgroundColor: theme.palette.TwClrBg,
    borderRadius: '24px',
    padding: '24px',
  },
  graphTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    margin: theme.spacing(0, 0, 3, 1),
  },
  graphTitleIcon: {
    fill: theme.palette.TwClrIcnSecondary,
  },
  graphTitle: {
    fontWeight: 600,
    fontSize: '20px',
    margin: theme.spacing(0, 1),
  },
  dropDownsContainer: {
    display: 'flex',
  },
  chartContainer: {
    marginTop: '40px',
  },
  legendContainer: {
    marginBottom: '32px',
    padding: (props: StyleProps) => (props.isMobile ? 0 : '0 78px 0 41px'),

    '& ul': {
      display: (props: StyleProps) => (props.isMobile ? 'block' : 'flex'),

      '& li': {
        marginLeft: (props: StyleProps) => (props.isMobile ? 0 : '10px'),
      },
    },
  },
  chartResizableParent: {
    position: 'relative',
    width: (props: StyleProps) => (props.isDesktop ? 'calc(100vw - 300px)' : 'calc(100vw - 136px)'),
    paddingRight: theme.spacing(4),
  },
}));

type PVBatteryChartProps = {
  BMU?: Device;
  defaultTimePeriod?: string;
  updateTimePeriodPreferences: (timePeriod: string) => void;
  timeZone: string;
};

export default function PVBatteryChart(props: PVBatteryChartProps): JSX.Element {
  const { isMobile, isDesktop } = useDeviceInfo();
  const classes = useStyles({ isMobile, isDesktop });
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
              // @ts-ignore
              y: {
                ticks: {
                  callback: (value, index, ticks) => {
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
                  callback: (value, index, ticks) => {
                    return strings.formatString(strings.WATTS_VALUE, numericFormatter.format(value)) as string;
                  },
                },
              },
            },
            plugins: {
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
                      label += moment(context.parsed.x).format('YYYY-MM-DDTHH:mm');
                    }
                    if (context.parsed.y !== null) {
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
        if (BMU) {
          const response = await getTimeseriesHistory(
            startTime.format(),
            endTime.format(),
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
    <div className={classes.graphContainer}>
      <div className={classes.graphTitleContainer}>
        <Icon name='futures' size='medium' className={classes.graphTitleIcon} />
        <p className={classes.graphTitle}>{strings.PV_BATTERY}</p>
      </div>
      <div className={classes.dropDownsContainer}>
        <Dropdown
          options={timePeriods()}
          onChange={onChangePVBatterySelectedPeriod}
          selectedValue={selectedPVBatteryPeriod}
          label={strings.TIME_PERIOD}
        />
      </div>
      <div className={classes.chartContainer}>
        <div id='legend-container-pvbattery' className={classes.legendContainer} />
        <div className={classes.chartResizableParent}>
          <canvas id='pvBatteryChart' ref={pvBatteryRef} />
        </div>
      </div>
    </div>
  );
}
