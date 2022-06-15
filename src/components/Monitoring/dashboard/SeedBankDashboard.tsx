import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Facility } from 'src/api/types/facilities';
import { listFacilityDevices } from 'src/api/facility/facility';
import { Device } from 'src/types/Device';
import Icon from '../../common/icon/Icon';
import { Grid } from '@material-ui/core';
import { listTimeseries } from 'src/api/timeseries/timeseries';
import TemperatureHumidityChart from './TemperatureHumidityChart';
import PVBatteryChart from './PVBatteryChart';
import { listDeviceManagers } from 'src/api/deviceManager/deviceManager';
import { DeviceManager } from 'src/types/DeviceManager';
import { useHistory } from 'react-router-dom';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import useQuery from '../../../utils/useQuery';
import { TIME_PERIODS } from './Common';

const useStyles = makeStyles((theme) =>
  createStyles({
    graphContainer: {
      border: '1px solid #A9B7B8',
      padding: '24px',
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

export default function SeedBankDashboard(props: SeedBankDashboardProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const query = useQuery();
  const stateLocation = useStateLocation();
  const { seedBank } = props;
  const [availableLocations, setAvailableLocations] = useState<Device[]>();
  const [batteryLevel, setBatteryLevel] = useState<string>();
  const [BMU, setBMU] = useState<Device>();
  const [deviceManager, setDeviceManager] = useState<DeviceManager | undefined>();
  const [defaultTimePeriod, setDefaultTimePeriod] = useState<string>();
  const [defaultSensor, setDefaultSensor] = useState<Device>();

  useEffect(() => {
    if (defaultSensor && defaultTimePeriod) {
      return;
    }
    if (!availableLocations?.length) {
      return;
    }
    setDefaultSensor(availableLocations[0]);
    setDefaultTimePeriod(TIME_PERIODS[0]);
  }, [availableLocations, defaultSensor, defaultTimePeriod]);

  useEffect(() => {
    if (!availableLocations?.length) {
      return;
    }
    const urlDeviceId = query.get('sensor');
    const urlTimePeriod = query.get('timePeriod');
    let location;
    let timePeriod;

    // set location to what url search param is set at
    if (urlDeviceId) {
      query.delete('sensor');
      location = availableLocations?.find((device) => {
        return device.type === 'sensor' && device.id.toString() === urlDeviceId;
      });
    }
    // set time period to what url search param is set at
    if (urlTimePeriod) {
      query.delete('timePeriod');
      timePeriod = TIME_PERIODS.find((period) => period === urlTimePeriod);
    }

    // set new location if valid
    if (location) {
      setDefaultSensor(location);
    }
    // set new time period if valid
    if (timePeriod) {
      setDefaultTimePeriod(timePeriod);
    }

    // clear url param if necessary
    if (urlDeviceId || urlTimePeriod) {
      history.push(getLocation(stateLocation.pathname, stateLocation, query.toString()));
    }
  }, [availableLocations, history, query, stateLocation]);

  useEffect(() => {
    const populateLocations = async () => {
      if (seedBank) {
        const locations = await listFacilityDevices(seedBank);
        setAvailableLocations(locations.devices.sort((deviceA, deviceB) => deviceA.name.localeCompare(deviceB.name)));
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
        <TemperatureHumidityChart
          availableLocations={availableLocations}
          defaultSensor={defaultSensor}
          defaultTimePeriod={defaultTimePeriod}
        />
      </Grid>
      <Grid item xs={12}>
        <PVBatteryChart BMU={BMU} defaultTimePeriod={defaultTimePeriod} />
      </Grid>
    </Grid>
  );
}
