import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import strings from 'src/strings';
import { Facility } from 'src/api/types/facilities';
import { listFacilityDevices } from 'src/api/facility/facility';
import { Device } from 'src/types/Device';
import Icon from '../../common/icon/Icon';
import { Grid, Theme } from '@mui/material';
import { listTimeseries } from 'src/api/timeseries/timeseries';
import TemperatureHumidityChart from './TemperatureHumidityChart';
import PVBatteryChart from './PVBatteryChart';
import { listDeviceManagers } from 'src/api/deviceManager/deviceManager';
import { DeviceManager } from 'src/types/DeviceManager';
import { useHistory } from 'react-router-dom';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import useQuery from '../../../utils/useQuery';
import { TIME_PERIODS } from './Common';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  isDesktop: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
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
    fontSize: (props: StyleProps) => (props.isDesktop ? '48px' : '36px'),
    margin: 0,
  },
}));

type SeedBankDashboardProps = {
  seedBank: Facility;
  monitoringPreferences: { [key: string]: unknown };
  updatePreferences: (data: { [key: string]: unknown }) => void;
};

export default function SeedBankDashboard(props: SeedBankDashboardProps): JSX.Element {
  const { isMobile, isDesktop } = useDeviceInfo();
  const classes = useStyles({ isDesktop });
  const history = useHistory();
  const query = useQuery();
  const stateLocation = useStateLocation();
  const { seedBank, monitoringPreferences, updatePreferences } = props;
  const [availableLocations, setAvailableLocations] = useState<Device[]>();
  const [batteryLevel, setBatteryLevel] = useState<string>();
  const [BMU, setBMU] = useState<Device>();
  const [deviceManager, setDeviceManager] = useState<DeviceManager | undefined>();
  const [defaultSensorTimePeriod, setDefaultSensorTimePeriod] = useState<string>();
  const [defaultPvTimePeriod, setDefaultPvTimePeriod] = useState<string>();
  const [defaultSensor, setDefaultSensor] = useState<Device>();

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 6;
  };

  useEffect(() => {
    setDefaultSensor(undefined);
    setAvailableLocations([]);
  }, [seedBank.id]);

  useEffect(() => {
    if (defaultSensor && defaultSensorTimePeriod && defaultPvTimePeriod) {
      return;
    }
    if (!availableLocations?.length) {
      return;
    }

    const lastVisitedLocation = availableLocations.find((loc) => loc.id === monitoringPreferences.sensorId);
    const locationToUse = lastVisitedLocation || availableLocations[0];
    const sensorTimePeriodToUse = (monitoringPreferences.sensorTimePeriod as string) || TIME_PERIODS[0];
    const pvTimePeriodToUse = (monitoringPreferences.pvTimePeriod as string) || TIME_PERIODS[0];

    setDefaultSensor(locationToUse);
    setDefaultSensorTimePeriod(sensorTimePeriodToUse);
    setDefaultPvTimePeriod(pvTimePeriodToUse);

    if (
      monitoringPreferences.sensorId !== locationToUse.id ||
      monitoringPreferences.sensorTimePeriod !== sensorTimePeriodToUse ||
      monitoringPreferences.pvTimePeriod !== pvTimePeriodToUse
    ) {
      updatePreferences({
        ...monitoringPreferences,
        sensorId: locationToUse.id,
        sensorTimePeriod: sensorTimePeriodToUse,
        pvTimePeriod: pvTimePeriodToUse,
      });
    }
  }, [
    availableLocations,
    defaultSensor,
    defaultSensorTimePeriod,
    defaultPvTimePeriod,
    monitoringPreferences,
    updatePreferences,
  ]);

  useEffect(() => {
    if (!availableLocations?.length) {
      return;
    }
    const urlDeviceId = query.get('sensor');
    const urlTimePeriod = query.get('timePeriod');
    let location;
    let timePeriod;
    const updates: { [key: string]: unknown } = {};

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
      updates.sensorId = location.id;
    }
    // set new time period if valid
    if (timePeriod) {
      setDefaultSensorTimePeriod(timePeriod);
      setDefaultPvTimePeriod(timePeriod);
      updates.sensorTimePeriod = timePeriod;
      updates.pvTimePeriod = timePeriod;
    }

    // clear url param if necessary
    if (urlDeviceId || urlTimePeriod) {
      history.push(getLocation(stateLocation.pathname, stateLocation, query.toString()));
    }

    if (location || timePeriod) {
      updatePreferences({
        ...monitoringPreferences,
        ...updates,
      });
    }
  }, [availableLocations, history, query, stateLocation, monitoringPreferences, updatePreferences]);

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
    <Grid container spacing={3} marginTop={0}>
      <Grid item xs={gridSize()}>
        <div className={classes.graphContainer}>
          <div className={classes.panelTitle}>
            <p>{strings.PV_BATTERY_CHARGE}</p>
            <Icon name='chargingBattery' />
          </div>
          <p className={classes.panelValue}>{batteryLevel || strings.NO_DATA_YET}</p>
        </div>
      </Grid>
      <Grid item xs={gridSize()}>
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
          defaultTimePeriod={defaultSensorTimePeriod}
          updateSensorPreferences={(sensorId) => updatePreferences({ ...monitoringPreferences, sensorId })}
          updateTimePeriodPreferences={(sensorTimePeriod) =>
            updatePreferences({ ...monitoringPreferences, sensorTimePeriod })
          }
        />
      </Grid>
      <Grid item xs={12}>
        <PVBatteryChart
          BMU={BMU}
          defaultTimePeriod={defaultPvTimePeriod}
          updateTimePeriodPreferences={(pvTimePeriod) => updatePreferences({ ...monitoringPreferences, pvTimePeriod })}
        />
      </Grid>
    </Grid>
  );
}
