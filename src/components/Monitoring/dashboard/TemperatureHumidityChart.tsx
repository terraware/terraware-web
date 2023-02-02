import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import Select from '../../common/Select/Select';
import Icon from '../../common/icon/Icon';
import { Chart } from 'chart.js';
import { Device } from 'src/types/Device';
import { getTimeseriesHistory } from 'src/api/timeseries/timeseries';
import moment from 'moment';
import {
  ChartPalette,
  getFirstWord,
  getTimePeriodParams,
  HumidityValues,
  getUnit,
  convertEntryTimestamp,
  timePeriods,
} from './Common';
import { htmlLegendPlugin } from './htmlLegendPlugin';
import 'chartjs-adapter-date-fns';
import { Theme } from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { Dropdown } from '@terraware/web-components';
import { useLocalization } from 'src/providers';

declare global {
  interface Window {
    temperatureHumidityChart: any;
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
  dropDowns: {
    display: 'block',
    margin: theme.spacing(0, 2, 2, 0),
  },
  chartContainer: {
    marginTop: '40px',
  },
  legendContainer: {
    marginBottom: '32px',
    padding: (props: StyleProps) => (props.isMobile ? 0 : '0 55px 0 41px'),

    '& ul': {
      display: (props: StyleProps) => (props.isMobile ? 'block ' : 'flex'),

      '& li': {
        marginLeft: (props: StyleProps) => (props.isMobile ? 0 : '10px'),
      },
    },
  },
  chartResizableParent: {
    position: 'relative',
    width: (props: StyleProps) => (props.isDesktop ? 'calc(100vw - 300px)' : 'calc(100vw - 136px)'),
    paddingRight: `${theme.spacing(4)}px`,
  },
}));

type TemperatureHumidityChartProps = {
  availableLocations?: Device[];
  defaultSensor?: Device;
  defaultTimePeriod?: string;
  updateSensorPreferences: (sensorId: number) => void;
  updateTimePeriodPreferences: (timePeriod: string) => void;
  timeZone: string;
};

export default function TemperatureHumidityChart(props: TemperatureHumidityChartProps): JSX.Element {
  const { isMobile, isDesktop } = useDeviceInfo();
  const classes = useStyles({ isMobile, isDesktop });
  const {
    availableLocations,
    defaultSensor,
    defaultTimePeriod,
    updateSensorPreferences,
    updateTimePeriodPreferences,
    timeZone,
  } = props;
  const [selectedLocation, setSelectedLocation] = useState<Device>();
  const [selectedPeriod, setSelectedPeriod] = useState<string>();
  const { loadedStringsForLocale } = useLocalization();

  useEffect(() => {
    if (defaultSensor) {
      setSelectedLocation(defaultSensor);
    }
  }, [defaultSensor]);

  useEffect(() => {
    if (defaultTimePeriod) {
      setSelectedPeriod(defaultTimePeriod);
    }
  }, [defaultTimePeriod]);

  useEffect(() => {
    const getMaxValue = (temperatureValues: HumidityValues[]) => {
      if (temperatureValues && temperatureValues.length) {
        return Math.max(...temperatureValues.map((tv) => Number(tv.value)));
      }
    };

    const getMinValue = (temperatureValues: HumidityValues[]) => {
      if (temperatureValues && temperatureValues.length) {
        return Math.min(...temperatureValues.map((tv) => Number(tv.value)));
      }
    };

    const createHTChart = (
      temperatureValues: HumidityValues[],
      humidityValues: HumidityValues[],
      chartReference: React.RefObject<HTMLCanvasElement>
    ) => {
      const ctx = chartReference?.current?.getContext('2d');
      if (ctx && selectedLocation && selectedPeriod) {
        const commonDatasets = [
          {
            data: temperatureValues?.map((entry) => {
              return { x: convertEntryTimestamp(entry.timestamp, timeZone), y: Number(entry.value) };
            }),
            label: strings.MONITORING_LABEL_TEMPERATURE, // Text to show in legend
            showLine: true, // If false, the line is not drawn for this dataset.
            borderColor: ChartPalette.TEMPERATURE.borderColor,
            backgroundColor: ChartPalette.TEMPERATURE.backgroundColor,
            fill: false, // How to fill the area under the line. See filling modes here: https://www.chartjs.org/docs/latest/charts/area.html#filling-modes
          },
          {
            data: temperatureValues?.map((entry) => {
              return {
                x: convertEntryTimestamp(entry.timestamp, timeZone),
                y: getTemperatureMinValue(selectedLocation?.name),
              };
            }),
            label: strings.MONITORING_LABEL_TEMPERATURE_THRESHOLDS,
            showLine: false,
            borderColor: ChartPalette.TEMPERATURE_THRESHOLD.borderColor,
            backgroundColor: ChartPalette.TEMPERATURE_THRESHOLD.backgroundColor,
            fill: false,
            pointRadius: 0,
          },
          {
            data: temperatureValues?.map((entry) => {
              return {
                x: convertEntryTimestamp(entry.timestamp, timeZone),
                y: getTemperatureMaxValue(selectedLocation?.name),
              };
            }),
            showLine: false,
            borderColor: ChartPalette.TEMPERATURE_THRESHOLD.borderColor,
            pointRadius: 0,
            fill: {
              target: 1, // fill to dataset 1
              above: ChartPalette.TEMPERATURE_THRESHOLD.fillColor,
            },
          },
          {
            data: humidityValues?.map((entry) => {
              return { x: convertEntryTimestamp(entry.timestamp, timeZone), y: Number(entry.value) };
            }),
            label: strings.MONITORING_LABEL_HUMIDITY,
            showLine: true,
            borderColor: ChartPalette.HUMIDITY.borderColor,
            backgroundColor: ChartPalette.HUMIDITY.backgroundColor,
            yAxisID: 'y1',
            fill: false,
          },
        ];

        const allDatasets = [
          {
            data: temperatureValues?.map((entry) => {
              return { x: convertEntryTimestamp(entry.timestamp, timeZone), y: Number(entry.value) };
            }),
            label: strings.MONITORING_LABEL_TEMPERATURE,
            showLine: true,
            borderColor: ChartPalette.TEMPERATURE.borderColor,
            backgroundColor: ChartPalette.TEMPERATURE.backgroundColor,
            fill: false,
          },
          {
            data: temperatureValues?.map((entry) => {
              return {
                x: convertEntryTimestamp(entry.timestamp, timeZone),
                y: getTemperatureMinValue(selectedLocation?.name),
              };
            }),
            label: strings.MONITORING_LABEL_TEMPERATURE_THRESHOLDS,
            showLine: true,
            borderColor: ChartPalette.TEMPERATURE_THRESHOLD.borderColor,
            backgroundColor: ChartPalette.TEMPERATURE_THRESHOLD.backgroundColor,
            fill: false,
            pointRadius: 0,
            borderWidth: 0,
          },
          {
            data: temperatureValues?.map((entry) => {
              return {
                x: convertEntryTimestamp(entry.timestamp, timeZone),
                y: getTemperatureMaxValue(selectedLocation?.name),
              };
            }),
            showLine: true,
            borderColor: ChartPalette.TEMPERATURE_THRESHOLD.borderColor,
            pointRadius: 0,
            borderWidth: 0,
            fill: {
              target: 1, // fill to dataset 1
              above: ChartPalette.TEMPERATURE_THRESHOLD.fillColor,
            },
          },

          {
            data: humidityValues?.map((entry) => {
              return {
                x: convertEntryTimestamp(entry.timestamp, timeZone),
                y: getHumidityMinValue(selectedLocation?.name),
              };
            }),
            label: strings.MONITORING_LABEL_HUMIDITY_THRESHOLDS,
            showLine: true,
            borderColor: ChartPalette.HUMIDITY_THRESHOLD.borderColor,
            backgroundColor: ChartPalette.HUMIDITY_THRESHOLD.backgroundColor,
            fill: false,
            pointRadius: 0,
            yAxisID: 'y1',
            borderWidth: 0,
          },
          {
            data: humidityValues?.map((entry) => {
              return {
                x: convertEntryTimestamp(entry.timestamp, timeZone),
                y: getHumidityMaxValue(selectedLocation?.name),
              };
            }),
            showLine: true,
            borderColor: ChartPalette.HUMIDITY_THRESHOLD.borderColor,
            fill: {
              target: 3,
              above: ChartPalette.HUMIDITY_THRESHOLD.fillColor,
            },
            pointRadius: 0,
            yAxisID: 'y1',
            borderWidth: 0,
          },
          {
            data: humidityValues?.map((entry) => {
              return { x: convertEntryTimestamp(entry.timestamp, timeZone), y: Number(entry.value) };
            }),
            label: strings.MONITORING_LABEL_HUMIDITY,
            showLine: true,
            borderColor: ChartPalette.HUMIDITY.borderColor,
            backgroundColor: ChartPalette.HUMIDITY.backgroundColor,
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

        const timePeriodParams = getTimePeriodParams(selectedPeriod, timeZone);
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
                suggestedMax: Number(getMaxValue(temperatureValues)) + 10,
                suggestedMin: Number(getMinValue(temperatureValues)) - 10,
              },
              x: {
                type: 'time',
                time: {
                  unit: getUnit(selectedPeriod),
                  displayFormats: {
                    hour: 'MMM d h:mm',
                  },
                },
                max:
                  temperatureValues?.length < timePeriodParams.numDataPoints
                    ? timePeriodParams.end.valueOf()
                    : undefined,
                min:
                  temperatureValues?.length < timePeriodParams.numDataPoints
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
        const timePeriodParams = getTimePeriodParams(selectedPeriod, timeZone);
        const startTime = timePeriodParams.start;
        const endTime = timePeriodParams.end;
        if (selectedLocation) {
          const response = await getTimeseriesHistory(
            startTime.format(),
            endTime.format(),
            [
              { deviceId: selectedLocation.id, timeseriesName: 'temperature' },
              { deviceId: selectedLocation.id, timeseriesName: 'humidity' },
            ],
            timePeriodParams.numDataPoints
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
    // don't reload chart when we are in-between switching seedbanks
    if (
      availableLocations?.length &&
      selectedLocation &&
      availableLocations.find((location) => location.id === selectedLocation.id)
    ) {
      getChartData();
    }
  }, [availableLocations, loadedStringsForLocale, selectedPeriod, selectedLocation, timeZone]);

  const onChangeLocation = (newValue: string) => {
    const location = availableLocations?.find((aL) => aL.name === newValue);
    setSelectedLocation(location);
    if (location) {
      updateSensorPreferences(location.id);
    }
  };

  const onChangeSelectedPeriod = (newValue: string) => {
    setSelectedPeriod(newValue);
    updateTimePeriodPreferences(newValue);
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
      <div className={classes.graphTitleContainer}>
        <Icon name='futures' size='medium' className={classes.graphTitleIcon} />
        <p className={classes.graphTitle}>{strings.TEMPERATURE_AND_HUMIDITY_SENSOR_DATA}</p>
      </div>
      <div className={isMobile ? '' : classes.dropDownsContainer}>
        <Select
          className={classes.dropDowns}
          options={availableLocations?.filter((location) => location.type === 'sensor').map((aL) => aL.name)}
          selectedValue={selectedLocation?.name}
          onChange={onChangeLocation}
          label={strings.LOCATION}
        />
        <Dropdown
          className={classes.dropDowns}
          options={timePeriods()}
          onChange={onChangeSelectedPeriod}
          selectedValue={selectedPeriod}
          label={strings.TIME_PERIOD}
        />
      </div>
      <div className={classes.chartContainer}>
        <div id='legend-container-th' className={classes.legendContainer} />
        <div className={classes.chartResizableParent}>
          <canvas id='temperatureHumidityChart' ref={chartRef} />
        </div>
      </div>
    </div>
  );
}
