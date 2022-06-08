import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Container, Grid } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import { ServerOrganization } from 'src/types/Organization';
import strings from 'src/strings';
import { Facility } from 'src/api/types/facilities';
import { DeviceManager } from 'src/types/DeviceManager';
import { Device } from 'src/types/Device';
import { listFacilityDevicesById } from 'src/api/facility/facility';
import FlowStep from './sensorKitSetup/FlowStep';
import SelectPVSystem from './sensorKitSetup/SelectPVSystem';
import SensorKitID from './sensorKitSetup/SensorKitID';
import InstallDeviceManager from './sensorKitSetup/InstallDeviceManager';
import DetectSensors from './sensorKitSetup/DetectSensors';
import SensorLocations from './sensorKitSetup/SensorLocations';
import { LOCATIONS } from './sensorKitSetup/Locations';

const useStyles = makeStyles((theme) =>
  createStyles({
    setupInfo: {
      textAlign: 'center',
      lineHeight: '28px',
      fontSize: '16px',
      marginTop: `${theme.spacing(10)}px`,
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
      margin: ' auto',
      marginTop: `${theme.spacing(5)}px`,
      justifyContent: 'center',
    },
  })
);

type SetupFlowState = 'PVSystem' | 'SensorKitID' | 'DeviceManager' | 'DetectSensors' | 'SensorLocations' | 'Complete';

type SensorKitSetupProps = {
  seedBank: Facility;
  organization: ServerOrganization;
  onFinish: () => void;
  reloadData: () => void;
};

type Completed = {
  [step in SetupFlowState]?: boolean;
};

export default function SensorKitSetup(props: SensorKitSetupProps): JSX.Element {
  const classes = useStyles();
  const { seedBank, onFinish, reloadData } = props;
  const [flowState, setFlowState] = useState<SetupFlowState>('PVSystem');
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

  useEffect(() => {
    const initializeDevices = async () => {
      let state: SetupFlowState = 'PVSystem';
      let completed: Completed = {};
      if (seedBank.connectionState === 'Connected') {
        const sensorDevices = await fetchSensors();
        // see if all sensors match the preset names, in which case we already have the sensors mapped to locations
        const presetNames = LOCATIONS.reduce((data: { [name: string]: boolean }, location) => {
          data[location.name] = true;
          return data;
        }, {});
        sensorDevices.forEach((device) => delete presetNames[device.name]);
        setSensors(sensorDevices);
        if (Object.keys(presetNames).length === 0) {
          state = 'Complete';
          completed = {
            PVSystem: true,
            SensorKitID: true,
            DeviceManager: true,
            DetectSensors: true,
            SensorLocations: true,
          };
        }
      }
      setFlowState(state);
      setCompletedSteps(completed);
    };

    initializeDevices();
  }, [fetchSensors, seedBank.connectionState]);

  return (
    <Container maxWidth={false}>
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
          onNext={(manager) => {
            setDeviceManager(manager);
            setCompletedAndNext('SensorKitID', 'DeviceManager');
          }}
          completed={completedSteps.SensorKitID}
          seedBank={seedBank}
        />
        <InstallDeviceManager
          active={flowState === 'DeviceManager'}
          onNext={(reload) => setCompletedAndNext('DeviceManager', 'DetectSensors', reload)}
          completed={completedSteps.DeviceManager}
          deviceManager={deviceManager}
          seedBank={seedBank}
        />
        <DetectSensors
          active={flowState === 'DetectSensors'}
          onNext={(reload, sensorDevices) => {
            setCompletedAndNext('DetectSensors', 'SensorLocations', reload);
            setSensors(sensorDevices);
          }}
          completed={completedSteps.DetectSensors}
          seedBank={seedBank}
        />
        <SensorLocations
          active={flowState === 'SensorLocations'}
          onNext={(reload) => setCompletedAndNext('SensorLocations', 'Complete', reload)}
          completed={completedSteps.SensorLocations}
          seedBank={seedBank}
          sensors={sensors}
        />
        <FlowStep
          flowState='Complete'
          active={flowState === 'Complete'}
          showNext={true}
          onNext={onFinish}
          buttonText={strings.TAKE_ME_THERE}
          title={strings.SENSOR_KIT_SET_UP_COMPLETE}
          completed={false}
        >
          <div className={classes.text}>{strings.SENSOR_KIT_SET_UP_COMPLETE_DESCRIPTION}</div>
        </FlowStep>
      </Grid>
    </Container>
  );
}
