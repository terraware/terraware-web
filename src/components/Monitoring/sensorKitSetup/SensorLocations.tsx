import { makeStyles } from '@mui/styles';
import { Grid, Theme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { Device } from 'src/types/Device';
import Select from '../../common/Select/Select';
import FlowStep, { FlowError } from './FlowStep';
import { updateDevice } from 'src/api/device/device';
import { LOCATIONS } from './Locations';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  location: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  gridContainer: {
    alignItems: 'end',
  },
}));

type Location = {
  [name: string]: Device;
};

type SensorLocationsProps = {
  seedBank: Facility;
  active: boolean;
  completed: boolean | undefined;
  onNext: () => void;
  sensors: Device[];
};

export default function SensorLocations(props: SensorLocationsProps): JSX.Element {
  const classes = useStyles();
  const { seedBank, active, completed, onNext, sensors } = props;
  const [flowError, setFlowError] = useState<FlowError | undefined>();
  const [processing, setProcessing] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [assignedLocations, setAssignedLocations] = useState<Location>({});
  const [showError, setShowError] = useState<boolean>(false);
  const { isMobile } = useDeviceInfo();

  const onChange = (locationName: string, deviceName?: string) => {
    setAssignedLocations((currentLocations) => {
      const newLocations = { ...currentLocations };
      const currentValue = currentLocations[locationName];
      if (deviceName && deviceName !== strings.SELECT) {
        const selectedDevice = availableDevices.find((device) => device.name === deviceName);
        if (selectedDevice) {
          newLocations[locationName] = selectedDevice;
          // remove device from list of available devices to select from
          setAvailableDevices((currentAvailable) => currentAvailable.filter((device) => device.name !== deviceName));
        }
      } else {
        delete newLocations[locationName];
      }
      if (currentValue) {
        // add device back to list of available devices to select from
        setAvailableDevices((currentAvailable) => {
          const newAvailable = [...currentAvailable, currentValue].sort((a, b) => a.name.localeCompare(b.name));
          return newAvailable;
        });
      }
      if (Object.keys(newLocations).length === LOCATIONS.length) {
        setShowError(false);
        setFlowError(undefined);
      }
      return newLocations;
    });
  };

  const goToNext = () => {
    const saveDevices = async () => {
      if (Object.keys(assignedLocations).length !== LOCATIONS.length) {
        setShowError(true);
        setFlowError({
          text: strings.SENSOR_LOCATION_ERROR,
        });
        return true;
      }
      setFlowError(undefined);
      setProcessing(true);
      const promises = LOCATIONS.map((location) => {
        const device = assignedLocations[location.name];
        return updateDevice({ ...device, name: location.name });
      });
      try {
        await Promise.all(promises);
        onNext();
      } catch (e) {
        setFlowError({
          title: strings.SERVER_ERROR,
          text: strings.GENERIC_ERROR,
        });
      }
      setProcessing(false);
    };
    saveDevices();
  };

  useEffect(() => {
    // re initialize if seed bank id changes
    setFlowError(undefined);
    setProcessing(false);
    setInitialized(false);
    setAvailableDevices([]);
    setAssignedLocations({});
    setShowError(false);
  }, [seedBank.id]);

  useEffect(() => {
    const initializeDevices = () => {
      if (initialized) {
        return;
      }
      setAvailableDevices(sensors.sort((a, b) => a.name.localeCompare(b.name)));
      setInitialized(true);
    };

    if (active && seedBank.connectionState === 'Connected') {
      initializeDevices();
    }
  }, [seedBank, initialized, active, sensors]);

  return (
    <FlowStep
      flowState='SensorLocations'
      active={active && initialized}
      showNext={true}
      disableNext={processing}
      flowError={flowError}
      onNext={goToNext}
      title={strings.SENSOR_KIT_SET_UP_SENSOR_LOCATIONS}
      completed={completed}
      buttonText={strings.DONE}
    >
      <div>{strings.SENSOR_KIT_SET_UP_SENSOR_LOCATIONS_DESCRIPTION}</div>
      <Grid container xs={12} className={classes.gridContainer}>
        {LOCATIONS.map((location) => (
          <Grid item xs={isMobile ? 12 : 4} key={location.name} className={classes.location}>
            <Select
              id={location.name}
              selectedValue={assignedLocations[location.name]?.name || ''}
              onChange={(value) => onChange(location.name, value)}
              options={(assignedLocations[location.name] ? [strings.SELECT] : []).concat(
                availableDevices.map((device) => device.name)
              )}
              label={location.label}
              aria-label={location.label}
              placeholder={strings.SELECT}
              fullWidth={true}
              errorText={showError && !assignedLocations[location.name] ? strings.REQUIRED_FIELD : ''}
            />
          </Grid>
        ))}
      </Grid>
    </FlowStep>
  );
}
