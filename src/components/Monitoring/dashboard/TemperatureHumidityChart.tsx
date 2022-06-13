import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import useQuery from '../../../utils/useQuery';
import strings from 'src/strings';
import Select from '../../common/Select/Select';
import { Chart } from 'chart.js';
import { Device } from 'src/types/Device';
import { getTimeseriesHistory } from 'src/api/timeseries/timeseries';
import moment from 'moment';
import { TIME_PERIODS, getFirstWord, getStartTime, HumidityValues } from './Common';
import { htmlLegendPlugin } from './htmlLegendPlugin';

declare global {
  interface Window {
    temperatureHumidityChart: any;
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
      padding: '0 55px 0 41px',
    },
  })
);

type TemperatureHumidityChartProps = {
  availableLocations?: Device[];
};

export default function TemperatureHumidityChart(props: TemperatureHumidityChartProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const query = useQuery();
  const stateLocation = useStateLocation();
  const { availableLocations } = props;
  const [selectedLocation, setSelectedLocation] = useState<Device>();
  const [selectedPeriod, setSelectedPeriod] = useState<string>();

  useEffect(() => {
    if (!availableLocations?.length) {
      return;
    }
    const urlDeviceId = query.get('deviceId');
    const urlTimePeriod = query.get('timePeriod');
    let location;
    let timePeriod;

    // set location to what url search param is set at
    if (urlDeviceId) {
      query.delete('deviceId');
      location = availableLocations?.find((device) => device.id.toString() === urlDeviceId);
    }
    // set time period to what url search param is set at
    if (urlTimePeriod) {
      query.delete('timePeriod');
      timePeriod = TIME_PERIODS.find((period) => period === urlTimePeriod);
    }

    // if location is not in url, keep existing selection (or default to first one if none-selected)
    if (!location) {
      location = selectedLocation || (availableLocations && availableLocations[0]);
    }
    // if time period is not in url, keep existing selection (or default to first one if none-selected)
    if (!timePeriod) {
      timePeriod = selectedPeriod || 'Last 12 hours';
    }

    // set new location if there is a change
    if (location !== selectedLocation) {
      setSelectedLocation(location);
    }
    // set new time period if there is a change
    if (timePeriod !== selectedPeriod) {
      setSelectedPeriod(timePeriod);
    }

    // clear url param if necessary
    if (urlDeviceId || urlTimePeriod) {
      history.push(getLocation(stateLocation.pathname, stateLocation, query.toString()));
    }
  }, [availableLocations, selectedLocation, selectedPeriod, history, query, stateLocation]);

  useEffect(() => {
    const createHTChart = (
      temperatureValues: HumidityValues[],
      humidityValues: HumidityValues[],
      chartReference: React.RefObject<HTMLCanvasElement>
    ) => {
      const ctx = chartReference?.current?.getContext('2d');
      if (ctx && selectedLocation) {
        const commonDatasets = [
          {
            data: temperatureValues?.map((entry) => {
              return { x: moment(entry.timestamp), y: Number(entry.value) };
            }),
            label: 'Temperature', // Text to show in legend
            showLine: true, // If false, the line is not drawn for this dataset.
            borderColor: '#FE0003', // The line border color.
            backgroundColor: '#FF5A5B', // The line fill color.
            fill: false, // How to fill the area under the line. See filling modes here: https://www.chartjs.org/docs/latest/charts/area.html#filling-modes
          },
          {
            data: temperatureValues?.map((entry) => {
              return { x: moment(entry.timestamp), y: getTemperatureMinValue(selectedLocation?.name) };
            }),
            label: 'Temperature Thresholds',
            showLine: false,
            borderColor: '#FF9797',
            backgroundColor: '#FFC1C1',
            fill: false,
            pointRadius: 0,
          },
          {
            data: temperatureValues?.map((entry) => {
              return { x: moment(entry.timestamp), y: getTemperatureMaxValue(selectedLocation?.name) };
            }),
            showLine: false,
            borderColor: '#FF9797',
            pointRadius: 0,
            fill: {
              target: 1, // fill to dataset 1
              above: '#FFBFD035', // Area will be red above the origin
            },
          },
          {
            data: humidityValues?.map((entry) => {
              return { x: moment(entry.timestamp), y: Number(entry.value) };
            }),
            label: 'Humidity',
            showLine: true,
            borderColor: '#0067C8',
            backgroundColor: '#007DF2',
            yAxisID: 'y1',
            fill: false,
          },
        ];

        const allDatasets = [
          {
            data: temperatureValues?.map((entry) => {
              return { x: moment(entry.timestamp), y: Number(entry.value) };
            }),
            label: 'Temperature',
            showLine: true,
            borderColor: '#FE0003',
            backgroundColor: '#FF5A5B',
            fill: false,
          },
          {
            data: temperatureValues?.map((entry) => {
              return { x: moment(entry.timestamp), y: getTemperatureMinValue(selectedLocation?.name) };
            }),
            label: 'Temperature Thresholds',
            showLine: false,
            borderColor: '#FF9797',
            backgroundColor: '#FFC1C1',
            fill: false,
            pointRadius: 0,
          },
          {
            data: temperatureValues?.map((entry) => {
              return { x: moment(entry.timestamp), y: getTemperatureMaxValue(selectedLocation?.name) };
            }),
            showLine: false,
            borderColor: '#FF9797',
            pointRadius: 0,
            fill: {
              target: 1, // fill to dataset 1
              above: '#FFBFD035', // Area will be red above the origin
            },
          },

          {
            data: humidityValues?.map((entry) => {
              return { x: moment(entry.timestamp), y: getHumidityMinValue(selectedLocation?.name) };
            }),
            label: 'Humidity Thresholds',
            showLine: false,
            borderColor: '#BED0FF',
            backgroundColor: '#E2E9FF',
            fill: false,
            pointRadius: 0,
            yAxisID: 'y1',
          },
          {
            data: humidityValues?.map((entry) => {
              return { x: moment(entry.timestamp), y: getHumidityMaxValue(selectedLocation?.name) };
            }),
            showLine: false,
            borderColor: '#BED0FF',
            fill: {
              target: 3,
              above: '#E2E9FF35',
            },
            pointRadius: 0,
            yAxisID: 'y1',
          },
          {
            data: humidityValues?.map((entry) => {
              return { x: moment(entry.timestamp), y: Number(entry.value) };
            }),
            label: 'Humidity',
            showLine: true,
            borderColor: '#0067C8',
            backgroundColor: '#007DF2',
            fill: false,
            yAxisID: 'y1',
          },
        ];

        let datasetsToUse;
        if (getFirstWord(selectedLocation.name) !== 'Fridge' && getFirstWord(selectedLocation.name) !== 'Freezer') {
          datasetsToUse = allDatasets;
        } else {
          datasetsToUse = commonDatasets;
        }
        window.temperatureHumidityChart = new Chart(ctx, {
          type: 'scatter',
          data: {
            datasets: datasetsToUse,
          },
          options: {
            scales: {
              y: {
                ticks: {
                  callback: (value, index, ticks) => {
                    return `${value}ºC`;
                  },
                },
              },

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
                ticks: {
                  callback: (value, index, ticks) => {
                    return `${value}%`;
                  },
                },
              },
            },
            plugins: {
              // @ts-ignore
              htmlLegend: {
                containerID: 'legend-container-th',
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
      if (selectedPeriod) {
        const startTime = getStartTime(selectedPeriod);
        const endTime = moment();
        if (selectedLocation) {
          const response = await getTimeseriesHistory(
            startTime.format(),
            endTime.format(),
            [
              { deviceId: selectedLocation.id, timeseriesName: 'temperature' },
              { deviceId: selectedLocation.id, timeseriesName: 'humidity' },
            ],
            12
          );

          if (response.requestSucceeded) {
            if (window.temperatureHumidityChart instanceof Chart) {
              window.temperatureHumidityChart.destroy();
            }
            createHTChart(response.values[0]?.values, response.values[1]?.values, chartRef);
          }
        }
      }
    };
    if (selectedLocation) {
      getChartData();
    }
  }, [availableLocations, selectedPeriod, selectedLocation]);

  const onChangeLocation = (newValue: string) => {
    setSelectedLocation(availableLocations?.find((aL) => aL.name === newValue));
  };

  const onChangeSelectedPeriod = (newValue: string) => {
    setSelectedPeriod(newValue);
  };

  const getTemperatureMinValue = (sensorName: string) => {
    switch (getFirstWord(sensorName)) {
      case 'Fridge':
        return 0;
      case 'Freezer':
        return -25;
      case 'Ambient':
        return 21;
      case 'Dry':
      case 'Drying':
        return 21;
      default:
        return 21;
    }
  };

  const getTemperatureMaxValue = (sensorName: string) => {
    switch (getFirstWord(sensorName)) {
      case 'Fridge':
        return 10;
      case 'Freezer':
        return -15;
      case 'Ambient':
        return 25;
      case 'Dry':
      case 'Drying':
        return 25;
      default:
        return 25;
    }
  };

  const getHumidityMinValue = (sensorName: string) => {
    switch (getFirstWord(sensorName)) {
      case 'Fridge':
        return 34;
      case 'Freezer':
        return 34;
      case 'Ambient':
        return 34;
      case 'Dry':
      case 'Drying':
        return 27;
      default:
        return 34;
    }
  };

  const getHumidityMaxValue = (sensorName: string) => {
    switch (getFirstWord(sensorName)) {
      case 'Fridge':
        return 40;
      case 'Freezer':
        return 40;
      case 'Ambient':
        return 40;
      case 'Dry':
      case 'Drying':
        return 33;
      default:
        return 40;
    }
  };

  const chartRef = React.useRef<HTMLCanvasElement>(null);

  return (
    <div className={classes.graphContainer}>
      <p className={classes.graphTitle}>{strings.TEMPERATURE_AND_HUMIDITY_SENSOR_DATA}</p>
      <div className={classes.dropDownsContainer}>
        <Select
          options={availableLocations?.filter((location) => location.type === 'sensor').map((aL) => aL.name)}
          selectedValue={selectedLocation?.name}
          onChange={onChangeLocation}
          label={strings.LOCATION}
        />
        <Select
          options={TIME_PERIODS}
          onChange={onChangeSelectedPeriod}
          selectedValue={selectedPeriod}
          label={strings.TIME_PERIOD}
        />
      </div>
      <div className={classes.chartContainer}>
        <div id='legend-container-th' className={classes.legendContainer} />
        <canvas id='temperatureHumidityChart' ref={chartRef} className={classes.chart} />
      </div>
    </div>
  );
}
