import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import { Facility } from 'src/api/types/facilities';
import { DeviceManager } from 'src/types/DeviceManager';
import TextField from '../../common/Textfield/Textfield';
import FlowStep, { FlowError } from './FlowStep';
import { listDeviceManagers } from 'src/api/deviceManager/deviceManager';

const useStyles = makeStyles((theme) =>
  createStyles({
    sensorKitId: {
      width: '432px',
    },
  })
);

type SensorKitIDProps = {
  seedBank: Facility;
  active: boolean;
  completed: boolean | undefined;
  onNext: (deviceManager: DeviceManager | undefined) => void;
};

export default function SensorKitID(props: SensorKitIDProps): JSX.Element {
  const classes = useStyles();
  const { seedBank, active, completed, onNext } = props;
  const [shortCode, setShortCode] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [flowError, setFlowError] = useState<FlowError | undefined>();
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (!active) {
      return;
    }
    if (seedBank.connectionState === 'Not Connected') {
      setInitialized(true);
    } else {
      onNext(undefined);
    }
  }, [seedBank, active, onNext]);

  const onChange = (id: string, value: unknown) => {
    setShortCode(value as string);
  };

  const goToNext = () => {
    setError(undefined);
    setFlowError(undefined);

    if (!shortCode) {
      setError(strings.REQUIRED_FIELD);
      setFlowError({ text: strings.FILL_OUT_ALL_FIELDS });
      return;
    }

    const fetchDeviceManager = async () => {
      const response = await listDeviceManagers(shortCode);
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

  return (
    <FlowStep
      flowState='SensorKitID'
      active={active && initialized}
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
            onChange={onChange}
            value={shortCode}
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
