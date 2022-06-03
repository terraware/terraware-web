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

declare global {
  interface Window {
    myChart: any;
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

  const onChangeLocation = (newValue: string) => {
    setSelectedLocation(availableLocations?.find((aL) => aL.name === newValue));
  };

  // const getStartTime = (period: string) => {
  //   switch (period) {
  //     case 'Last 12 hours':
  //       return moment(Date.now()).subtract(12, 'h');
  //     case 'Last 24 hours':
  //       return moment(Date.now()).subtract(24, 'h');
  //     case 'Last 7 days':
  //       return moment(Date.now()).subtract(7, 'd');
  //     case 'Last 30 days':
  //       return moment(Date.now()).subtract(30, 'd');
  //     default:
  //       return moment();
  //   }
  // };

  const onChangeSelectedPeriod = (newValue: string) => {
    setSelectedPeriod(newValue);
    // let startTime = getStartTime(newValue);
    // const endTime = moment();

    const response = {
      values: [
        {
          deviceId: 123,
          timeseriesName: 'Temperature',
          values: [
            { timestamp: '1', value: '567.89' },
            { timestamp: '4', value: '570.91' },
            { timestamp: '5', value: '535.13' },
          ],
        },
        {
          deviceId: 123,
          timeseriesName: 'Humidity',
          values: [
            { timestamp: '2', value: '350.89' },
            { timestamp: '3', value: '200.89' },
            { timestamp: '4', value: '160.91' },
            { timestamp: '6', value: '110.13' },
          ],
        },
      ],
    };

    if (window.myChart instanceof Chart) {
      window.myChart.destroy();
    }
    createChart(response.values[0].values, response.values[1].values);
  };

  const chartRef = React.useRef<HTMLCanvasElement>(null);

  const createChart = (values1: HumidityValues[], values2: HumidityValues[]) => {
    const ctx = chartRef?.current?.getContext('2d');
    if (ctx) {
      window.myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [
            {
              data: values1?.map((entry) => {
                return { x: entry.timestamp, y: entry.value };
              }),
              label: 'Temperature',
              showLine: true,
              fill: false,
              borderColor: '#FE0003',
              backgroundColor: '#FF5A5B',
            },
            {
              data: values2?.map((entry) => {
                return { x: entry.timestamp, y: entry.value };
              }),
              label: 'Humidity',
              showLine: true,
              fill: false,
              borderColor: '#0067C8',
              backgroundColor: '#007DF2',
            },
            {
              data: ['1', '2', '3', '4', '5', '6'].map((entry) => {
                return { x: entry, y: '200' };
              }),
              label: 'Temperature Thresholds',
              showLine: false,
              borderColor: '#FF9797',
              backgroundColor: '#FFC1C1',
              fill: false,
              pointRadius: 0,
            },
            {
              data: ['1', '2', '3', '4', '5', '6'].map((entry) => {
                return { x: entry, y: '250' };
              }),
              showLine: false,
              borderColor: '#FF9797',
              pointRadius: 0,
              fill: {
                target: 2,
                above: '#FFBFD035', // Area will be red above the origin
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
                    <p className={classes.panelValue}>80%</p>
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
