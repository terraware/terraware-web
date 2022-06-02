import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { ServerOrganization } from 'src/types/Organization';
import EmptyMessage from '../common/EmptyMessage';
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { useHistory } from 'react-router-dom';
import { getAllSeedBanks, isAdmin } from 'src/utils/organization';
import TfMain from '../common/TfMain';
import Select from '../common/Select/Select';
import { Facility } from 'src/api/types/facilities';
import EmptyStateContent from '../emptyStatePages/EmptyStateContent';
import { EMPTY_STATE_CONTENT_STYLES } from '../emptyStatePages/EmptyStatePage';
import { listFacilityDevices } from 'src/api/facility/facility';
import { Device } from 'src/types/Device';
import { Chart } from 'chart.js';
import Button from '../common/button/Button';

declare global {
  interface Window {
    myChart: any;
  }
}

const useStyles = makeStyles((theme) =>
  createStyles({
    mainTitle: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    pageTitle: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: 600,
      margin: 0,
    },
    text: {
      fontSize: '24px',
      margin: 'auto auto',
    },
    message: {
      margin: '0 auto',
      width: '50%',
      marginTop: '10%',
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    divider: {
      margin: '0 16px',
      width: '1px',
      height: '32px',
      backgroundColor: '#A9B7B8',
    },
    seedBankLabel: {
      margin: '0 8px 0 0',
      fontWeight: 500,
      fontSize: '16px',
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
  })
);

type MonitoringProps = {
  organization: ServerOrganization;
  hasSeedBanks: boolean;
};

type HumidityValues = {
  timestamp: string;
  value: string;
};

export default function Monitoring(props: MonitoringProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const { organization, hasSeedBanks } = props;
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility>();
  const [availableLocations, setAvailableLocations] = useState<Device[]>();
  const [selectedLocation, setSelectedLocation] = useState<Device>();
  const [selectedPeriod, setSelectedPeriod] = useState<string>();

  const seedBanks = getAllSeedBanks(organization);

  const goToSeedBanks = () => {
    const seedBanksLocation = {
      pathname: APP_PATHS.SEED_BANKS,
    };
    history.push(seedBanksLocation);
  };

  useEffect(() => {
    setSelectedSeedBank(getAllSeedBanks(organization)[0]);
  }, [organization]);

  useEffect(() => {
    const populateLocations = async () => {
      if (selectedSeedBank) {
        const locations = await listFacilityDevices(selectedSeedBank);
        setAvailableLocations(locations.devices);
      }
    };
    populateLocations();
  }, [selectedSeedBank]);

  const onChangeSeedBank = (newValue: string) => {
    setSelectedSeedBank(seedBanks.find((sb) => sb?.name === newValue));
  };
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
      {hasSeedBanks ? (
        <TfMain>
          <div className={classes.mainTitle}>
            <div className={classes.titleContainer}>
              <h1 className={classes.pageTitle}>{strings.MONITORING}</h1>
              <div className={classes.divider} />
              <p className={classes.seedBankLabel}>{strings.SEED_BANK}</p>
              <Select
                options={seedBanks.map((sb) => sb?.name || '')}
                onChange={onChangeSeedBank}
                selectedValue={selectedSeedBank?.name}
              />
            </div>
            {selectedSeedBank?.connectionState === 'Configured' ? (
              <Button label={strings.REFRESH_DATA} onClick={() => true} />
            ) : null}
          </div>
          {selectedSeedBank?.connectionState === 'Configured' ? (
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
        </TfMain>
      ) : isAdmin(organization) ? (
        <EmptyMessage
          className={classes.message}
          title={emptyMessageStrings.NO_SEEDBANKS_ADMIN_TITLE}
          text={emptyMessageStrings.NO_SEEDBANKS_MONITORING_ADMIN_MSG}
          buttonText={strings.GO_TO_SEED_BANKS}
          onClick={goToSeedBanks}
        />
      ) : (
        <EmptyMessage
          className={classes.message}
          title={emptyMessageStrings.NO_SEEDBANKS_NON_ADMIN_TITLE}
          text={emptyMessageStrings.NO_SEEDBANKS_MONITORING_NON_ADMIN_MSG}
        />
      )}
    </>
  );
}
