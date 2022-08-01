import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import Select from '../../common/Select/Select';
import { Chart } from 'chart.js';
import { Device } from 'src/types/Device';
import { getTimeseriesHistory } from 'src/api/timeseries/timeseries';
import moment from 'moment';
import { ChartPalette, TIME_PERIODS, getTimePeriodParams, HumidityValues, getUnit } from './Common';
import { htmlLegendPlugin } from './htmlLegendPlugin';
import 'chartjs-adapter-date-fns';

declare global {
  interface Window {
    pvBatteryChart: any;
  }
}

const useStyles = makeStyles((theme: Theme) => ({
  graphContainer: {
    border: '1px solid #A9B7B8',
    padding: '24px',
  },
  graphTitle: {
    fontWeight: 600,
    fontSize: '20px',
    margin: '0 0 24px 0',
  },
  dropDownsContainer: {
    display: 'flex',
  },
  chartContainer: {
    marginTop: '40px',
  },
  legendContainer: {
    marginBottom: '32px',
    padding: '0 78px 0 41px',
  },
  chartResizableParent: {
    position: 'relative',
    width: 'calc(100vw - 300px)',
    paddingRight: theme.spacing(4),
  },
}));

type PVBatteryChartProps = {
  BMU?: Device;
  defaultTimePeriod?: string;
};

export default function PVBatteryChart(props: PVBatteryChartProps): JSX.Element {
  const classes = useStyles();
  const { BMU, defaultTimePeriod } = props;
  const [selectedPVBatteryPeriod, setSelectedPVBatteryPeriod] = useState<string>();

  useEffect(() => {
    if (defaultTimePeriod) {
      setSelectedPVBatteryPeriod(defaultTimePeriod);
    }
  }, [defaultTimePeriod]);

  useEffect(() => {
    const createBatteryChart = (
      stateOfChargeValues: HumidityValues[],
      powerValues: HumidityValues[],
      chartReference: React.RefObject<HTMLCanvasElement>
    ) => {
      const ctx = chartReference?.current?.getContext('2d');
      if (ctx && selectedPVBatteryPeriod) {
        const timePeriodParams = getTimePeriodParams(selectedPVBatteryPeriod);
        window.pvBatteryChart = new Chart(ctx, {
          type: 'scatter',
          data: {
            datasets: [
              {
                data: stateOfChargeValues?.map((entry) => {
                  return { x: entry.timestamp, y: Number(entry.value) };
                }),
                label: 'State of Charge',
                showLine: true,
                fill: false,
                borderColor: ChartPalette.STATE_OF_CHARGE.borderColor,
                backgroundColor: ChartPalette.STATE_OF_CHARGE.backgroundColor,
              },
              {
                data: powerValues?.map((entry) => {
                  return { x: entry.timestamp, y: Number(entry.value) };
                }),
                label: 'System Power',
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
                    return `${value}%`;
                  },
                },
              },
              x: {
                type: 'time',
                time: {
                  unit: getUnit(selectedPVBatteryPeriod),
                  displayFormats: {
                    hour: 'MMM d h:mm',
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
                    return `${value}W`;
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
        const timePeriodParams = getTimePeriodParams(selectedPVBatteryPeriod);
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
            createBatteryChart(response.values[0]?.values, response.values[1]?.values, pvBatteryRef);
          }
        }
      }
    };
    if (selectedPVBatteryPeriod) {
      getChartData();
    }
  }, [BMU, selectedPVBatteryPeriod]);

  const onChangePVBatterySelectedPeriod = (newValue: string) => {
    setSelectedPVBatteryPeriod(newValue);
  };

  const pvBatteryRef = React.useRef<HTMLCanvasElement>(null);

  return (
    <div className={classes.graphContainer}>
      <p className={classes.graphTitle}>{strings.PV_BATTERY}</p>
      <div className={classes.dropDownsContainer}>
        <Select
          options={TIME_PERIODS}
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
