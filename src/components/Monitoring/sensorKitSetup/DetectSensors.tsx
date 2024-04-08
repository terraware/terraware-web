import React, { useCallback, useEffect, useState } from 'react';

import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { listFacilityDevicesById } from 'src/api/facility/facility';
import getHelpEmail from 'src/components/common/HelpEmail';
import ProgressCircle from 'src/components/common/ProgressCircle/ProgressCircle';
import strings from 'src/strings';
import { Device } from 'src/types/Device';
import { Facility } from 'src/types/Facility';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import FlowStep, { FlowError } from './FlowStep';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  detectSensors: {
    width: (props: StyleProps) => (props.isMobile ? '100%' : '432px'),
    fontStyle: 'italic',
    display: 'flex',
    alignItems: 'center',
  },
  detectInProgress: {
    marginLeft: theme.spacing(2),
  },
}));

const TOTAL_SENSORS = 14;

type DetectSensorsProps = {
  seedBank: Facility;
  active: boolean;
  completed: boolean | undefined;
  onNext: (sensors: Device[]) => void;
};

export default function DetectSensors(props: DetectSensorsProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const { seedBank, active, completed, onNext } = props;
  const [flowError, setFlowError] = useState<FlowError | undefined>();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [detectFinished, setDetectFinished] = useState<boolean>(false);
  const [pollingStartedOn, setPollingStartedOn] = useState<number>(0);
  const [keepPolling, setKeepPolling] = useState<boolean>(false);
  const [sensorsFound, setSensorsFound] = useState<Device[]>([]);

  const pollForSensors = useCallback(() => {
    const tryAgain = () => {
      setFlowError(undefined);
      setPollingStartedOn(Date.now());
      setKeepPolling(true);
    };

    const poll = async () => {
      setKeepPolling(false);
      const response = await listFacilityDevicesById(seedBank.id);
      if (response.requestSucceeded === false) {
        setFlowError({
          title: strings.SERVER_ERROR,
          text: strings.GENERIC_ERROR,
          buttonText: strings.TRY_AGAIN,
          onClick: tryAgain,
        });
        return;
      }

      const sensors = response.devices.filter((device) => device.type === 'sensor');
      setSensorsFound(sensors);

      if (sensors.length >= TOTAL_SENSORS) {
        setDetectFinished(true);
        return;
      }

      // if we have polled for over 20 minutes, stop and error out
      const currentTime = Date.now();
      if (pollingStartedOn && currentTime - pollingStartedOn >= 20 * 60 * 1000) {
        setFlowError({
          title: strings.SENSOR_SCAN_TIMEOUT,
          text: strings.formatString(
            strings.SENSOR_SCAN_TIMEOUT_ERROR,
            sensorsFound as any,
            TOTAL_SENSORS as any,
            getHelpEmail() as any
          ) as string,
          buttonText: strings.TRY_AGAIN,
          onClick: tryAgain,
        });
        return;
      }

      setKeepPolling(true);
    };

    poll();
  }, [pollingStartedOn, seedBank.id, sensorsFound]);

  useEffect(() => {
    // re initialize if seed bank id changes
    setFlowError(undefined);
    setInitialized(false);
    setDetectFinished(false);
    setPollingStartedOn(0);
    setKeepPolling(false);
    setSensorsFound([]);
  }, [seedBank.id]);

  useEffect(() => {
    if (active && seedBank.connectionState === 'Connected') {
      setInitialized(true);
      if (!pollingStartedOn) {
        setPollingStartedOn(Date.now());
        pollForSensors();
      }
    }
  }, [seedBank, active, pollingStartedOn, pollForSensors]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    if (keepPolling) {
      setFlowError(undefined);
      timeout = setTimeout(pollForSensors, 5 * 1000);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [keepPolling, pollForSensors]);

  return (
    <FlowStep
      flowState='DetectSensors'
      active={active && initialized}
      showNext={detectFinished}
      flowError={flowError}
      onNext={() => onNext(sensorsFound)}
      title={strings.SENSOR_KIT_SET_UP_DETECT_SENSORS}
      completed={completed}
      footer={
        <div className={classes.detectSensors}>
          <ProgressCircle
            size='small'
            determinate={true}
            value={(sensorsFound.length / TOTAL_SENSORS) * 100}
            hideValue={true}
          />
          <span className={classes.detectInProgress}>
            {detectFinished && strings.ALL_SENSORS_FOUND}
            {!detectFinished && strings.formatString(strings.SENSORS_FOUND, sensorsFound.length, TOTAL_SENSORS)}
          </span>
        </div>
      }
    >
      <div>{strings.SENSOR_KIT_SET_UP_DETECT_SENSORS_DESCRIPTION}</div>
    </FlowStep>
  );
}
