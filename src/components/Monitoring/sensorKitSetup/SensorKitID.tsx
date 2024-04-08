import React, { useEffect, useState } from 'react';

import { makeStyles } from '@mui/styles';

import { listDeviceManagers } from 'src/api/deviceManager/deviceManager';
import strings from 'src/strings';
import { DeviceManager } from 'src/types/DeviceManager';
import { Facility } from 'src/types/Facility';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import TextField from '../../common/Textfield/Textfield';
import FlowStep, { FlowError } from './FlowStep';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles(() => ({
  sensorKitId: {
    width: (props: StyleProps) => (props.isMobile ? '100%' : '432px'),
  },
}));

type SensorKitIDProps = {
  seedBank: Facility;
  active: boolean;
  completed: boolean | undefined;
  onNext: (deviceManager: DeviceManager | undefined) => void;
};

export default function SensorKitID(props: SensorKitIDProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const { seedBank, active, completed, onNext } = props;
  const [sensorKitId, setSensorKitId] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [flowError, setFlowError] = useState<FlowError | undefined>();
  const [initialized, setInitialized] = useState<boolean>(false);

  const onChange = (id: string, value: unknown) => {
    setSensorKitId(value as string);
  };

  const goToNext = () => {
    setError(undefined);
    setFlowError(undefined);

    if (!sensorKitId) {
      setError(strings.REQUIRED_FIELD);
      setFlowError({ text: strings.FILL_OUT_ALL_FIELDS });
      return;
    }

    const fetchDeviceManager = async () => {
      const response = await listDeviceManagers({ sensorKitId });
      if (response.requestSucceeded === false) {
        setFlowError({
          title: strings.SERVER_ERROR,
          text: strings.PLEASE_TRY_AGAIN,
        });
        return;
      }
      if (!response.managers.length) {
        setError(strings.KEY_WAS_NOT_RECOGNIZED);
        setFlowError({ text: strings.PLEASE_TRY_AGAIN });
        return;
      }

      const manager = response.managers[0];
      if (manager.facilityId && manager.facilityId !== seedBank.id) {
        setError(strings.KEY_BELONGS_TO_ANOTHER_SEED_BANK);
        setFlowError({ text: strings.PLEASE_TRY_AGAIN });
        return;
      }

      onNext(manager);
    };

    fetchDeviceManager();
  };

  useEffect(() => {
    // re initialize if seed bank id changes
    setSensorKitId(undefined);
    setError(undefined);
    setFlowError(undefined);
    setInitialized(false);
  }, [seedBank.id]);

  useEffect(() => {
    if (!active || initialized) {
      return;
    }
    setInitialized(true);
    if (seedBank.connectionState !== 'Not Connected') {
      onNext(undefined);
    }
  }, [seedBank, active, onNext, initialized]);

  return (
    <FlowStep
      flowState='SensorKitID'
      active={active && seedBank.connectionState === 'Not Connected'}
      showNext={true}
      flowError={flowError}
      onNext={goToNext}
      title={strings.SENSOR_KIT_SET_UP_SENSOR_KIT_ID}
      completed={completed}
      footerError={!!error}
      footer={
        <div className={classes.sensorKitId}>
          <TextField
            id='sensor-kit-id'
            label={strings.ENTER_SIX_DIGIT_KEY}
            type='text'
            onChange={(value) => onChange('sensor-kit-id', value)}
            value={sensorKitId}
            errorText={error}
            placeholder={strings.SENSOR_KIT_ID_PLACEHOLDER}
          />
        </div>
      }
    >
      <div>{strings.SENSOR_KIT_SET_UP_SENSOR_KIT_ID_DESCRIPTION}</div>
    </FlowStep>
  );
}
