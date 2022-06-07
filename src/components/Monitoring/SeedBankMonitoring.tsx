import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { ServerOrganization } from 'src/types/Organization';
import EmptyMessage from '../common/EmptyMessage';
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import strings from 'src/strings';
import { isAdmin } from 'src/utils/organization';
import { Facility } from 'src/api/types/facilities';
import EmptyStateContent from '../emptyStatePages/EmptyStateContent';
import { EMPTY_STATE_CONTENT_STYLES } from '../emptyStatePages/EmptyStatePage';
import SensorKitSetup from './SensorKitSetup';
import Select from '../common/Select/Select';
import { listFacilityDevices } from 'src/api/facility/facility';
import { Chart } from 'chart.js';
import { Device } from 'src/types/Device';
import Icon from '../common/icon/Icon';
import { Grid } from '@material-ui/core';
import { getTimeseriesHistory, listTimeseries } from 'src/api/device/device';
import moment from 'moment';

declare global {
  interface Window {
    myChart: any;
    pvBatteryChart: any;
  }
}

type HumidityValues = {
  timestamp: string;
  value: string;
};

const useStyles = makeStyles((theme) =>
  createStyles({
    placeholder: {
      display: 'flex',
      height: '100%',
    },
    text: {
      fontSize: '24px',
    },
    message: {
      margin: '0 auto',
      width: '50%',
      marginTop: '10%',
    },
    notSetUpContent: {
      border: '1px solid #A9B7B8',
      borderRadius: '8px',
      margin: 'auto',
      marginTop: `max(10vh, ${theme.spacing(8)}px)`,
      maxWidth: '800px',
    },
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
    panelTitle: {
      display: 'flex',
      fontSize: '20px',
      fontWeight: 600,
      justifyContent: 'space-between',

      '& p': {
        margin: '0 0 32px 0',
      },
    },
    panelValue: {
      fontWeight: 600,
      fontSize: '48px',
      margin: 0,
    },
    mainGrid: {
      display: 'flex',
      width: '100%',
      margin: 0,
    },
  })
);

type SeedBankMonitoringProps = {
  seedBank: Facility;
  organization: ServerOrganization;
};

export default function Monitoring(props: SeedBankMonitoringProps): JSX.Element {
  const classes = useStyles();
  const { organization, seedBank } = props;
  const [onboarding, setOnboarding] = useState<boolean>(false);
  const isConfigured = seedBank.connectionState === 'Configured';
  const [availableLocations, setAvailableLocations] = useState<Device[]>();
  const [selectedLocation, setSelectedLocation] = useState<Device>();
  const [selectedPeriod, setSelectedPeriod] = useState<string>();
  const [selectedPVBatteryPeriod, setSelectedPVBatteryPeriod] = useState<string>();
  const [batteryLevel, setBatteryLevel] = useState<string>();
  const [BMU, setBMU] = useState<Device>();

  useEffect(() => {
    const isConnected = seedBank.connectionState === 'Connected';
    setOnboarding(isConnected);
  }, [seedBank, setOnboarding]);

  const onFinishOnboarding = () => {
    setOnboarding(false);
  };

  useEffect(() => {
    const populateLocations = async () => {
      if (seedBank) {
        const locations = await listFacilityDevices(seedBank);
        setAvailableLocations(locations.devices);
      }
    };
    populateLocations();
  }, [seedBank]);

  useEffect(() => {
    const populateBaterryLevel = async () => {
      const BMUDevices = availableLocations?.filter((device) => device.type === 'BMU');
      if (BMUDevices) {
        setBMU(BMUDevices[0]);
        const response = await listTimeseries(BMUDevices[0]);
        if (response.requestSucceeded) {
          const bmuTimeseries = response.timeseries;
          const battery = bmuTimeseries.filter((bmuTs) => bmuTs.timeseriesName === 'relative_state_of_charge');
          if (battery[0] && battery[0].latestValue) {
            setBatteryLevel(battery[0].latestValue?.value);
          }
        }
      }
    };
    populateBaterryLevel();
  }, [availableLocations]);

  const onChangeLocation = (newValue: string) => {
    setSelectedLocation(availableLocations?.find((aL) => aL.name === newValue));
  };

  const getStartTime = (period: string) => {
    switch (period) {
      case 'Last 12 hours':
        return moment(Date.now()).subtract(12, 'h');
      case 'Last 24 hours':
        return moment(Date.now()).subtract(24, 'h');
      case 'Last 7 days':
        return moment(Date.now()).subtract(7, 'd');
      case 'Last 30 days':
        return moment(Date.now()).subtract(30, 'd');
      default:
        return moment();
    }
  };

  const onChangeSelectedPeriod = async (newValue: string) => {
    setSelectedPeriod(newValue);
    let startTime = getStartTime(newValue);
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
        if (window.myChart instanceof Chart) {
          window.myChart.destroy();
        }
        createHTChart(response.values[0]?.values, response.values[1]?.values, chartRef, 'myChart');
      }
    }
  };

  const onChangePVBatterySelectedPeriod = async (newValue: string) => {
    setSelectedPVBatteryPeriod(newValue);
    let startTime = getStartTime(newValue);
    const endTime = moment();
    if (BMU) {
      const response = await getTimeseriesHistory(
        startTime.format(),
        endTime.format(),
        [
          { deviceId: BMU.id, timeseriesName: 'relative_state_of_charge' },
          { deviceId: BMU.id, timeseriesName: 'dc_voltage' },
          { deviceId: BMU.id, timeseriesName: 'current' },
        ],
        12
      );

      if (response.requestSucceeded) {
        if (window.myChart instanceof Chart) {
          window.myChart.destroy();
        }
        if (window.pvBatteryChart instanceof Chart) {
          window.pvBatteryChart.destroy();
        }
        createBatteryChart(
          response.values[0]?.values,
          response.values[1]?.values,
          response.values[2]?.values,
          pvBatteryRef,
          'pvBatteryChart'
        );
      }
    }
  };

  const chartRef = React.useRef<HTMLCanvasElement>(null);
  const pvBatteryRef = React.useRef<HTMLCanvasElement>(null);

  const createHTChart = (
    temperatureValues: HumidityValues[],
    humidityValues: HumidityValues[],
    chartReference: React.RefObject<HTMLCanvasElement>,
    chartName: 'myChart' | 'pvBatteryChart'
  ) => {
    const ctx = chartReference?.current?.getContext('2d');
    if (ctx) {
      window[chartName] = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              data: temperatureValues?.map((entry) => {
                return { x: moment(entry.timestamp), y: Number(entry.value) };
              }),
              label: 'Temperature',
              showLine: true,
              fill: false,
              borderColor: '#FE0003',
              backgroundColor: '#FF5A5B',
            },
            {
              data: humidityValues?.map((entry) => {
                return { x: moment(entry.timestamp), y: Number(entry.value) };
              }),
              label: 'Humidity',
              showLine: true,
              fill: false,
              borderColor: '#0067C8',
              backgroundColor: '#007DF2',
            },
            {
              data: temperatureValues?.map((entry) => {
                return { x: moment(entry.timestamp), y: 23 };
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
                return { x: moment(entry.timestamp), y: 26 };
              }),
              showLine: false,
              borderColor: '#FF9797',
              pointRadius: 0,
              fill: {
                target: 2,
                above: '#FFBFD035', // Area will be red above the origin
              },
            },
            {
              data: humidityValues?.map((entry) => {
                return { x: moment(entry.timestamp), y: 26 };
              }),
              label: 'Humidity Thresholds',
              showLine: false,
              borderColor: '#BED0FF',
              backgroundColor: '#E2E9FF',
              fill: false,
              pointRadius: 0,
            },
            {
              data: humidityValues?.map((entry) => {
                return { x: moment(entry.timestamp), y: 30 };
              }),
              showLine: false,
              borderColor: '#BED0FF',
              pointRadius: 0,
              fill: {
                target: 2,
                above: '#E2E9FF35', // Area will be red above the origin
              },
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
                callback: function (value, index, ticks) {
                  return moment(value).format();
                },
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                filter(legendItem: { text: string | string[] }, data: any) {
                  // only show 2nd dataset in legend
                  return legendItem.text !== undefined;
                },
              },
            },
          },
        },
      });
    }
  };

  const createBatteryChart = (
    stateOfChargeValues: HumidityValues[],
    voltageValues: HumidityValues[],
    currentValues: HumidityValues[],
    chartReference: React.RefObject<HTMLCanvasElement>,
    chartName: 'myChart' | 'pvBatteryChart'
  ) => {
    const ctx = chartReference?.current?.getContext('2d');
    if (ctx) {
      window[chartName] = new Chart(ctx, {
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
                callback: function (value, index, ticks) {
                  return moment(value).format();
                },
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
          },
        },
      });
    }
  };

  return (
    <>
      {!isConfigured && !onboarding && (
        <>
          {isAdmin(organization) ? (
            <div className={classes.notSetUpContent}>
              <EmptyStateContent
                title={strings.SET_UP_YOUR_SENSOR_KIT}
                subtitle={strings.SET_UP_YOUR_SENSOR_KIT_MSG}
                listItems={[{ icon: 'monitoring', title: strings.SENSOR_KIT_SET_UP }]}
                buttonText={strings.START_SET_UP}
                onClickButton={() => setOnboarding(true)}
                styles={EMPTY_STATE_CONTENT_STYLES}
              />
            </div>
          ) : (
            <EmptyMessage
              className={classes.message}
              title={emptyMessageStrings.NO_SEEDBANKS_NON_ADMIN_TITLE}
              text={emptyMessageStrings.NO_SEEDBANKS_SET_UP_NON_ADMIN_MSG}
            />
          )}
        </>
      )}
      {isConfigured && !onboarding && (
        <div className={classes.placeholder}>
          <span className={classes.text}>
            {seedBank?.connectionState === 'Configured' ? (
              <Grid container spacing={3} className={classes.mainGrid}>
                <Grid item xs={6}>
                  <div className={classes.graphContainer}>
                    <div className={classes.panelTitle}>
                      <p>{strings.PV_BATTERY_CHARGE}</p>
                      <Icon name='chargingBattery' />
                    </div>
                    <p className={classes.panelValue}>{batteryLevel}</p>
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div className={classes.graphContainer}>
                    <div className={classes.panelTitle}>
                      <p>{strings.SEED_BANK_INTERNET}</p>
                      <Icon name='wifi' />
                    </div>
                    <p className={classes.panelValue}>{strings.CONNECTED}</p>
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div className={classes.graphContainer}>
                    <p className={classes.graphTitle}>{strings.TEMPERATURE_AND_HUMIDITY_SENSOR_DATA}</p>
                    <div className={classes.dropDownsContainer}>
                      <Select
                        options={availableLocations?.map((aL) => aL.name)}
                        selectedValue={selectedLocation?.name}
                        onChange={onChangeLocation}
                        label={strings.LOCATION}
                      />
                      <Select
                        options={['Last 12 hours', 'Last 24 hours', 'Last 7 days', 'Last 30 days']}
                        onChange={onChangeSelectedPeriod}
                        selectedValue={selectedPeriod}
                        label={strings.TIME_PERIOD}
                      />
                    </div>
                    <div className={classes.chartContainer}>
                      <canvas id='myChart' ref={chartRef} className={classes.chart} />
                    </div>
                  </div>
                </Grid>
                <Grid item xs={12}>
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
                </Grid>
              </Grid>
            ) : (
              <>
                {isAdmin(organization) ? (
                  <div className={classes.notSetUpContent}>
                    <EmptyStateContent
                      title={strings.SET_UP_YOUR_SENSOR_KIT}
                      subtitle={strings.SET_UP_YOUR_SENSOR_KIT_MSG}
                      listItems={[{ icon: 'monitoring', title: strings.SENSOR_KIT_SET_UP }]}
                      buttonText={strings.START_SET_UP}
                      onClickButton={() => true}
                      styles={EMPTY_STATE_CONTENT_STYLES}
                    />
                  </div>
                ) : (
                  <EmptyMessage
                    className={classes.message}
                    title={emptyMessageStrings.NO_SEEDBANKS_NON_ADMIN_TITLE}
                    text={emptyMessageStrings.NO_SEEDBANKS_SET_UP_NON_ADMIN_MSG}
                  />
                )}
              </>
            )}
          </span>
        </div>
      )}
      {onboarding && <SensorKitSetup organization={organization} seedBank={seedBank} onFinish={onFinishOnboarding} />}
    </>
  );
}
