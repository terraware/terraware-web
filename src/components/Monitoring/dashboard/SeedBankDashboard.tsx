import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Grid, useTheme } from '@mui/material';

import { listDeviceManagers } from 'src/api/deviceManager/deviceManager';
import { listFacilityDevices } from 'src/api/facility/facility';
import { listTimeseries } from 'src/api/timeseries/timeseries';
import TimeZoneSelector from 'src/components/TimeZoneSelector';
import strings from 'src/strings';
import { Device } from 'src/types/Device';
import { DeviceManager } from 'src/types/DeviceManager';
import { Facility } from 'src/types/Facility';
import { TimeZoneDescription } from 'src/types/TimeZones';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

import useQuery from '../../../utils/useQuery';
import Icon from '../../common/icon/Icon';
import { timePeriods } from './Common';
import PVBatteryChart from './PVBatteryChart';
import TemperatureHumidityChart from './TemperatureHumidityChart';

type SeedBankDashboardProps = {
  seedBank: Facility;
  monitoringPreferences: { [key: string]: unknown };
  updatePreferences: (data: { [key: string]: unknown }) => void;
};

export default function SeedBankDashboard(props: SeedBankDashboardProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const navigate = useNavigate();
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
  const tz = useLocationTimeZone().get(seedBank);
  const [tzSelected, setTzSelected] = useState<string>(tz.id);

  const graphContainerStyles = {
    backgroundColor: theme.palette.TwClrBg,
    borderRadius: '24px',
    padding: theme.spacing(3),
  };

  const panelTitleStyles = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: 600,
    margin: theme.spacing(0, 0, 3, 1),
    '& p': {
      margin: theme.spacing(0, 1),
    },
  };

  const panelIconStyles = {
    fill: theme.palette.TwClrIcnSecondary,
  };

  const panelValueStyles = {
    fontWeight: 600,
    fontSize: '32px',
    margin: 0,
  };

  const onChangeTimeZone = (newTimeZone: TimeZoneDescription | undefined) => {
    if (newTimeZone) {
      setTzSelected(newTimeZone.id);
    }
  };

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
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

    const defaultTimePeriod = timePeriods()[0].value;
    const lastVisitedLocation = availableLocations.find((loc) => loc.id === monitoringPreferences.sensorId);
    const locationToUse = lastVisitedLocation || availableLocations[0];
    const sensorTimePeriodToUse = (monitoringPreferences.sensorTimePeriod as string) || defaultTimePeriod;
    const pvTimePeriodToUse = (monitoringPreferences.pvTimePeriod as string) || defaultTimePeriod;

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
      timePeriod = timePeriods().find((period) => period.value === urlTimePeriod)?.value;
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
      navigate(getLocation(stateLocation.pathname, stateLocation, query.toString()));
    }

    if (location || timePeriod) {
      updatePreferences({
        ...monitoringPreferences,
        ...updates,
      });
    }
  }, [availableLocations, navigate, query, stateLocation, monitoringPreferences, updatePreferences]);

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
        <Box sx={graphContainerStyles}>
          <Box sx={panelTitleStyles}>
            <Icon name='chargingBattery' size='medium' style={panelIconStyles} />
            <p>{strings.PV_BATTERY_CHARGE}</p>
          </Box>
          <p style={panelValueStyles}>{batteryLevel || strings.NO_DATA_YET}</p>
        </Box>
      </Grid>
      <Grid item xs={gridSize()}>
        <Box sx={graphContainerStyles}>
          <Box sx={panelTitleStyles}>
            <Icon name='wifi' size='medium' style={panelIconStyles} />
            <p>{strings.SEED_BANK_INTERNET}</p>
          </Box>
          <p style={panelValueStyles}>{deviceManager?.isOnline ? strings.CONNECTED : strings.NOT_CONNECTED}</p>
        </Box>
      </Grid>
      <Grid item xs={gridSize()}>
        <Box sx={graphContainerStyles}>
          <Box sx={panelTitleStyles}>
            <p>{strings.TIME_ZONE}</p>
          </Box>
          <TimeZoneSelector selectedTimeZone={tzSelected} onTimeZoneSelected={onChangeTimeZone} />
        </Box>
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
          timeZone={tzSelected}
        />
      </Grid>
      <Grid item xs={12}>
        <PVBatteryChart
          BMU={BMU}
          defaultTimePeriod={defaultPvTimePeriod}
          updateTimePeriodPreferences={(pvTimePeriod) => updatePreferences({ ...monitoringPreferences, pvTimePeriod })}
          timeZone={tzSelected}
        />
      </Grid>
    </Grid>
  );
}
