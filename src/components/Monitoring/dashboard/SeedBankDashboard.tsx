import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Facility } from 'src/api/types/facilities';
import { listFacilityDevices } from 'src/api/facility/facility';
import { Device } from 'src/types/Device';
import Icon from '../../common/icon/Icon';
import { Grid } from '@material-ui/core';
import { listTimeseries } from 'src/api/timeseries/timeseries';
import moment from 'moment';
import TemperatureHumidityChart from './TemperatureHumidityChart';
import PVBatteryChart from './PVBatteryChart';
import { listDeviceManagers } from 'src/api/deviceManager/deviceManager';
import { DeviceManager } from 'src/types/DeviceManager';

const useStyles = makeStyles((theme) =>
  createStyles({
    graphContainer: {
      border: '1px solid #A9B7B8',
      padding: '24px',
      height: '179px',
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

type SeedBankDashboardProps = {
  seedBank: Facility;
};

export type HumidityValues = {
  timestamp: string;
  value: string;
};

export const getStartTime = (period: string) => {
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

export const getFirstWord = (sensorName: string) => {
  const sensorNameWords = sensorName.split(' ');
  return sensorNameWords[0];
};

export default function SeedBankDashboard(props: SeedBankDashboardProps): JSX.Element {
  const classes = useStyles();
  const { seedBank } = props;
  const [availableLocations, setAvailableLocations] = useState<Device[]>();
  const [batteryLevel, setBatteryLevel] = useState<string>();
  const [BMU, setBMU] = useState<Device>();
  const [deviceManager, setDeviceManager] = useState<DeviceManager | undefined>();

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
    const getDeviceManager = async () => {
      if (seedBank) {
        const { managers } = await listDeviceManagers({ facilityId: seedBank.id });
        if (managers.length) {
          setDeviceManager(managers[0]);
        }
      }
    };
    getDeviceManager();
  }, [seedBank]);

  useEffect(() => {
    const populateBatteryLevel = async () => {
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
    populateBatteryLevel();
  }, [availableLocations]);

  return (
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
          <p className={classes.panelValue}>{deviceManager?.isOnline ? strings.CONNECTED : strings.NOT_CONNECTED}</p>
        </div>
      </Grid>
      <Grid item xs={12}>
        <TemperatureHumidityChart availableLocations={availableLocations} />
      </Grid>
      <Grid item xs={12}>
        <PVBatteryChart BMU={BMU} />
      </Grid>
    </Grid>
  );
}
