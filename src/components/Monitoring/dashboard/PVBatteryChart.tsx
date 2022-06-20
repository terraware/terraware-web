import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import Select from '../../common/Select/Select';
import { Chart } from 'chart.js';
import { Device } from 'src/types/Device';
import { getTimeseriesHistory } from 'src/api/timeseries/timeseries';
import moment from 'moment';
import { TIME_PERIODS, getStartTime, HumidityValues, getUnit } from './Common';
import { htmlLegendPlugin } from './htmlLegendPlugin';
import 'chartjs-adapter-date-fns';

declare global {
  interface Window {
    pvBatteryChart: any;
  }
}

const useStyles = makeStyles((theme) =>
  createStyles({
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
    chart: {
      width: '800px',
    },
    legendContainer: {
      marginBottom: '32px',
      padding: '0 78px 0 41px',
    },
  })
);

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
      voltageValues: HumidityValues[],
      currentValues: HumidityValues[],
      chartReference: React.RefObject<HTMLCanvasElement>
    ) => {
      const ctx = chartReference?.current?.getContext('2d');
      if (ctx && selectedPVBatteryPeriod) {
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
                borderColor: '#FE0003',
                backgroundColor: '#FF5A5B',
              },
              {
                data: voltageValues?.map((entry) => {
                  return { x: entry.timestamp, y: Number(entry.value) };
                }),
                label: 'System Voltage',
                showLine: true,
                fill: false,
                borderColor: '#0067C8',
                backgroundColor: '#007DF2',
                yAxisID: 'y1',
              },
              {
                data: currentValues?.map((entry) => {
                  return { x: entry.timestamp, y: Number(entry.value) };
                }),
                label: 'System Current',
                showLine: true,
                borderColor: '#DAAF38',
                backgroundColor: '#FBCA47',
                fill: false,
                yAxisID: 'y2',
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
                max: stateOfChargeValues?.length < 12 ? moment().valueOf() : undefined,
                min: stateOfChargeValues?.length < 12 ? getStartTime(selectedPVBatteryPeriod).valueOf() : undefined,
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
                    return `${value}V`;
                  },
                },
              },
              y2: {
                type: 'linear',
                display: true,
                position: 'right',
                // grid line settings
                grid: {
                  drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
                ticks: {
                  callback: (value, index, ticks) => {
                    return `${value}A`;
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
        const startTime = getStartTime(selectedPVBatteryPeriod);
        const endTime = moment();
        if (BMU) {
          const response = await getTimeseriesHistory(
            startTime.format(),
            endTime.format(),
            [
              { deviceId: BMU.id, timeseriesName: 'relative_state_of_charge' },
              { deviceId: BMU.id, timeseriesName: 'system_voltage' },
              { deviceId: BMU.id, timeseriesName: 'system_current' },
            ],
            12
          );

          if (response.requestSucceeded) {
            if (window.pvBatteryChart instanceof Chart) {
              window.pvBatteryChart.destroy();
            }
            createBatteryChart(
              response.values[0]?.values,
              response.values[1]?.values,
              response.values[2]?.values,
              pvBatteryRef
            );
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
        <canvas id='pvBatteryChart' ref={pvBatteryRef} className={classes.chart} />
      </div>
    </div>
  );
}
