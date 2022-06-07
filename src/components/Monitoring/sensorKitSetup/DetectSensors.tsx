import { createStyles, makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import strings from 'src/strings';
import { Facility } from 'src/api/types/facilities';
import FlowStep, { FlowError } from './FlowStep';
import { listFacilityDevices } from 'src/api/facility/facility';

const useStyles = makeStyles((theme) =>
  createStyles({
    detectSensors: {
      width: '432px',
      fontStyle: 'italic',
    },
    spinnerContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    detectInProgress: {
      marginLeft: `${theme.spacing(2)}px`,
    },
  })
);

const TOTAL_SENSORS = 14;

type DetectSensorsProps = {
  seedBank: Facility;
  active: boolean;
  completed: boolean | undefined;
  onNext: () => void;
};

export default function DetectSensors(props: DetectSensorsProps): JSX.Element {
  const classes = useStyles();
  const { seedBank, active, completed, onNext } = props;
  const [flowError, setFlowError] = useState<FlowError | undefined>();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [detectFinished, setDetectFinished] = useState<boolean>(false);
  const [pollingStartedOn, setPollingStartedOn] = useState<number>(0);
  const [keepPolling, setKeepPolling] = useState<boolean>(false);
  const [sensorsFound, setSensorsFound] = useState<number>(0);

  const pollForSensors = useCallback(() => {
    const tryAgain = () => {
      setFlowError(undefined);
      setPollingStartedOn(Date.now());
      setKeepPolling(true);
    };

    const poll = async () => {
      const response = await listFacilityDevices(seedBank);
      if (response.requestSucceeded === false) {
        setFlowError({
          title: strings.SERVER_ERROR,
          text: strings.GENERIC_ERROR,
          buttonText: strings.TRY_AGAIN,
          onClick: tryAgain,
        });
        return;
      }

      const numSensors = response.devices.filter((device) => device.type === 'sensor').length;
      setSensorsFound(numSensors);

      if (numSensors === TOTAL_SENSORS) {
        setDetectFinished(true);
        return;
      }

      // if we have polled for over 20 minutes, stop and error out
      const currentTime = Date.now();
      if (pollingStartedOn && currentTime - pollingStartedOn >= 20 * 60 * 1000) {
        setFlowError({
          title: strings.SENSOR_SCAN_TIMEOUT,
          text: strings.formatString(strings.SENSOR_SCAN_TIMEOUT_ERROR, sensorsFound, TOTAL_SENSORS) as string,
          buttonText: strings.TRY_AGAIN,
          onClick: tryAgain,
        });
        return;
      }

      setKeepPolling(true);
    };

    poll();
  }, [pollingStartedOn, seedBank, sensorsFound]);

  useEffect(() => {
    if (!active) {
      return;
    }
    if (seedBank.connectionState === 'Connected') {
      setInitialized(true);
      if (!pollingStartedOn) {
        setPollingStartedOn(Date.now());
        setKeepPolling(true);
      }
    } else {
      onNext();
    }
  }, [seedBank, active, onNext, pollingStartedOn]);

  useEffect(() => {
    if (keepPolling) {
      setFlowError(undefined);
      setTimeout(pollForSensors, 5 * 1000);
      setKeepPolling(false);
    }
  }, [keepPolling, pollForSensors]);

  return (
    <FlowStep
      flowState='DetectSensors'
      active={active && initialized}
      showNext={detectFinished}
      flowError={flowError}
      onNext={onNext}
      title={strings.SENSOR_KIT_SET_UP_DETECT_SENSORS}
      completed={completed}
      footer={
        <div className={classes.detectSensors}>
          {detectFinished && <span>{strings.ALL_SENSORS_FOUND}</span>}
          {!detectFinished && (
            <div className={classes.spinnerContainer}>
              <CircularProgress />
              <span className={classes.detectInProgress}>
                {strings.formatString(strings.SENSORS_FOUND, sensorsFound, TOTAL_SENSORS)}
              </span>
            </div>
          )}
        </div>
      }
    >
      <div>{strings.SENSOR_KIT_SET_UP_DETECT_SENSORS_DESCRIPTION}</div>
    </FlowStep>
  );
}
