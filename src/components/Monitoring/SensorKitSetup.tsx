import React, { useCallback, useEffect, useState } from 'react';

import { Theme } from '@mui/material';
import { Container, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { listDeviceManagers } from 'src/api/deviceManager/deviceManager';
import { listFacilityDevicesById } from 'src/api/facility/facility';
import strings from 'src/strings';
import { Device } from 'src/types/Device';
import { DeviceManager } from 'src/types/DeviceManager';
import { Facility } from 'src/types/Facility';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ConfigureSensorKit from './sensorKitSetup/ConfigureSensorKit';
import DetectSensors from './sensorKitSetup/DetectSensors';
import InstallDeviceManager from './sensorKitSetup/InstallDeviceManager';
import { LOCATIONS } from './sensorKitSetup/Locations';
import SelectPVSystem from './sensorKitSetup/SelectPVSystem';
import SensorKitID from './sensorKitSetup/SensorKitID';
import SensorLocations from './sensorKitSetup/SensorLocations';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mobileSetupContainer: {
    padding: 0,
  },
  setupInfo: {
    textAlign: 'center',
    lineHeight: '28px',
    fontSize: '16px',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
  },
  setupTitle: {
    fontWeight: 'bold',
    fontSize: '18px',
    lineHeight: '28px',
  },
  text: {
    textAlign: 'center',
    fontSize: '14px',
    margin: 'auto auto',
  },
  onboardingContainer: {
    display: 'flex',
    margin: (props: StyleProps) => (props.isMobile ? `auto auto ${theme.spacing(3)}` : 'auto'),
    marginTop: theme.spacing(5),
    justifyContent: 'center',
  },
}));

type SetupFlowState = 'PVSystem' | 'SensorKitID' | 'DeviceManager' | 'DetectSensors' | 'SensorLocations' | 'Configure';

type SensorKitSetupProps = {
  seedBank: Facility;
  onFinish: () => void;
  reloadData: () => void;
};

type Completed = {
  [step in SetupFlowState]?: boolean;
};

export default function SensorKitSetup(props: SensorKitSetupProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const { seedBank, onFinish, reloadData } = props;
  const [flowState, setFlowState] = useState<SetupFlowState | undefined>();
  const [completedSteps, setCompletedSteps] = useState<Completed>({});
  const [deviceManager, setDeviceManager] = useState<DeviceManager | undefined>();
  const [sensors, setSensors] = useState<Device[]>([]);

  const fetchSensors = useCallback(async () => {
    const response = await listFacilityDevicesById(seedBank.id);
    const sensorDevices = response.devices.filter((device) => device.type === 'sensor');
    return sensorDevices;
  }, [seedBank.id]);

  const setCompletedAndNext = (currentState: SetupFlowState, nextState: SetupFlowState, reload?: boolean) => {
    const processData = async () => {
      if (reload) {
        reloadData();
      }
      if (nextState === 'SensorLocations' && !sensors.length) {
        const sensorDevices = await fetchSensors();
        setSensors(sensorDevices);
      }
      setCompletedSteps((currentCompleted) => {
        const newCompleted = { ...currentCompleted };
        newCompleted[currentState] = true;
        return newCompleted;
      });
      setFlowState(nextState);
    };
    processData();
  };

  const onSensorKitID = (manager?: DeviceManager) => {
    const delegateDeviceManager = async () => {
      if (manager) {
        setDeviceManager(manager);
      } else {
        // this is a user visiting setup after navigating away from it
        // fetch device manager again from seed bank id
        const { managers } = await listDeviceManagers({ facilityId: seedBank.id });
        if (managers.length) {
          setDeviceManager(managers[0]);
        }
      }
      setCompletedAndNext('SensorKitID', 'DeviceManager');
    };
    delegateDeviceManager();
  };

  const onDeviceManager = () => {
    const initializeDevices = async () => {
      const sensorDevices = await fetchSensors();
      // see if all sensors match the preset names, in which case we already have the sensors mapped to locations
      const presetNames = LOCATIONS.reduce((data: { [name: string]: boolean }, location) => {
        data[location.name] = true;
        return data;
      }, {});
      sensorDevices.forEach((device) => delete presetNames[device.name]);
      if (Object.keys(presetNames).length === 0) {
        setFlowState('Configure');
        setCompletedSteps({
          PVSystem: true,
          SensorKitID: true,
          DeviceManager: true,
          DetectSensors: true,
          SensorLocations: true,
        });
      } else {
        setCompletedAndNext('DeviceManager', 'DetectSensors');
      }
    };

    initializeDevices();
  };

  useEffect(() => {
    // reset all if seed bank changes
    setFlowState('PVSystem');
    setCompletedSteps({});
    setDeviceManager(undefined);
    setSensors([]);
  }, [seedBank.id]);

  return (
    <Container maxWidth={false} className={isMobile ? classes.mobileSetupContainer : ''}>
      <div className={classes.setupInfo}>
        <div className={classes.setupTitle}>{strings.SENSOR_KIT_SET_UP_TITLE} &#127881;</div>
        <div>{strings.SENSOR_KIT_SET_UP_DESCRIPTION}</div>
        <div>{strings.SENSOR_KIT_SET_UP_TIME}</div>
      </div>
      <Grid container className={classes.onboardingContainer}>
        <SelectPVSystem
          active={flowState === 'PVSystem'}
          onNext={() => setCompletedAndNext('PVSystem', 'SensorKitID')}
          completed={completedSteps.PVSystem}
          seedBank={seedBank}
        />
        <SensorKitID
          active={flowState === 'SensorKitID'}
          onNext={onSensorKitID}
          completed={completedSteps.SensorKitID}
          seedBank={seedBank}
        />
        <InstallDeviceManager
          active={flowState === 'DeviceManager'}
          onNext={onDeviceManager}
          completed={completedSteps.DeviceManager}
          deviceManager={deviceManager}
          seedBank={seedBank}
          reloadData={reloadData}
        />
        <DetectSensors
          active={flowState === 'DetectSensors'}
          onNext={(sensorDevices) => {
            setCompletedAndNext('DetectSensors', 'SensorLocations');
            setSensors(sensorDevices);
          }}
          completed={completedSteps.DetectSensors}
          seedBank={seedBank}
        />
        <SensorLocations
          active={flowState === 'SensorLocations'}
          onNext={() => setCompletedAndNext('SensorLocations', 'Configure', true)}
          completed={completedSteps.SensorLocations}
          seedBank={seedBank}
          sensors={sensors}
        />
        <ConfigureSensorKit active={flowState === 'Configure'} onNext={onFinish} seedBank={seedBank} />
      </Grid>
    </Container>
  );
}
