import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import strings from 'src/strings';
import Select from '../../common/Select/Select';
import { Chart } from 'chart.js';
import { Device } from 'src/types/Device';
import { getTimeseriesHistory } from 'src/api/timeseries/timeseries';
import moment from 'moment';
import { getStartTime, HumidityValues } from './SeedBankDashboard';

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
  })
);

type PVBatteryChartProps = {
  BMU?: Device;
};

export default function PVBatteryChart(props: PVBatteryChartProps): JSX.Element {
  const classes = useStyles();
  const { BMU } = props;
  const [selectedPVBatteryPeriod, setSelectedPVBatteryPeriod] = useState<string>();

  const onChangePVBatterySelectedPeriod = async (newValue: string) => {
    setSelectedPVBatteryPeriod(newValue);
    const startTime = getStartTime(newValue);
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
  };
  const pvBatteryRef = React.useRef<HTMLCanvasElement>(null);

  const createBatteryChart = (
    stateOfChargeValues: HumidityValues[],
    voltageValues: HumidityValues[],
    currentValues: HumidityValues[],
    chartReference: React.RefObject<HTMLCanvasElement>
  ) => {
    const ctx = chartReference?.current?.getContext('2d');
    if (ctx) {
      window.pvBatteryChart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              data: stateOfChargeValues?.map((entry) => {
                return { x: moment(entry.timestamp), y: Number(entry.value) };
              }),
              label: 'State of Charge',
              showLine: true,
              fill: false,
              borderColor: '#FE0003',
              backgroundColor: '#FF5A5B',
            },
            {
              data: voltageValues?.map((entry) => {
                return { x: moment(entry.timestamp), y: Number(entry.value) };
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
                return { x: moment(entry.timestamp), y: Number(entry.value) };
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
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
            x: {
              ticks: {
                callback: (value, index, ticks) => {
                  return moment(value).format('YYYY-MM-DDTHH:mm');
                },
              },
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              // grid line settings
              grid: {
                drawOnChartArea: false, // only want the grid lines for one axis to show up
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
            },
          },
          plugins: {
            legend: {
              labels: {
                filter(legendItem: { text: string | string[] }, data: any) {
                  // only show datasets with name on legend
                  return legendItem.text !== undefined;
                },
              },
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
      });
    }
  };

  return (
    <div className={classes.graphContainer}>
      <p className={classes.graphTitle}>{strings.PV_BATTERY}</p>
      <div className={classes.dropDownsContainer}>
        <Select
          options={['Last 12 hours', 'Last 24 hours', 'Last 7 days', 'Last 30 days']}
          onChange={onChangePVBatterySelectedPeriod}
          selectedValue={selectedPVBatteryPeriod}
          label={strings.TIME_PERIOD}
        />
      </div>
      <div className={classes.chartContainer}>
        <canvas id='pvBatteryChart' ref={pvBatteryRef} className={classes.chart} />
      </div>
    </div>
  );
}
