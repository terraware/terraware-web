import { createStyles, makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import strings from 'src/strings';
import { Facility } from 'src/api/types/facilities';
import { DeviceManager } from 'src/types/DeviceManager';
import FlowStep, { FlowError } from './FlowStep';
import { connectDeviceManager, getDeviceManager } from 'src/api/deviceManager/deviceManager';

const useStyles = makeStyles((theme) =>
  createStyles({
    installDeviceManager: {
      width: '432px',
      fontStyle: 'italic',
    },
    spinnerContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    downloadInProgress: {
      marginLeft: `${theme.spacing(2)}px`,
    },
  })
);

type InstallDeviceManagerProps = {
  seedBank: Facility;
  deviceManager?: DeviceManager;
  active: boolean;
  completed: boolean | undefined;
  onNext: () => void;
};

export default function InstallDeviceManager(props: InstallDeviceManagerProps): JSX.Element {
  const classes = useStyles();
  const { seedBank, active, completed, onNext, deviceManager } = props;
  const [flowError, setFlowError] = useState<FlowError | undefined>();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [updateFinished, setUpdateFinished] = useState<boolean>(false);
  const [pollingStartedOn, setPollingStartedOn] = useState<number>(0);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [keepPolling, setKeepPolling] = useState<boolean>(false);

  const checkDeviceManagerProgress = useCallback(() => {
    const checkProgress = async () => {
      const response = await getDeviceManager(deviceManager!.id);
      if (response.manager === undefined) {
        setFlowError({
          title: strings.CONNECT_FAILED,
          text: strings.UNABLE_TO_CONNECT_TO_SENSOR_KIT,
        });
        return;
      }

      const {
        manager: { updateProgress },
      } = response;
      if (updateProgress === undefined || updateProgress === 100) {
        setUpdateFinished(true);
        return;
      } else {
        setProgressPercentage(updateProgress);
      }

      // if we have polled for over 20 minutes, stop and error out
      const currentTime = Date.now();
      if (pollingStartedOn && currentTime - pollingStartedOn >= 20 * 60 * 1000) {
        setFlowError({
          title: strings.DOWNLOAD_FAILED,
          text: strings.DOWNLOAD_FAILED_DESCRIPTION,
          buttonText: strings.TRY_AGAIN,
          onClick: () => {
            setPollingStartedOn(Date.now());
            setKeepPolling(true);
          },
        });
        return;
      }
      setKeepPolling(true);
    };

    checkProgress();
  }, [deviceManager, pollingStartedOn]);

  useEffect(() => {
    if (keepPolling) {
      setFlowError(undefined);
      setTimeout(checkDeviceManagerProgress, 5 * 1000);
      setKeepPolling(false);
    }
  }, [keepPolling, checkDeviceManagerProgress]);

  const connectAndWaitForDeviceManager = useCallback(() => {
    const connect = async () => {
      if (pollingStartedOn) {
        return;
      }
      setFlowError(undefined);
      // connect and wait
      const response = await connectDeviceManager(deviceManager!.id, seedBank.id);
      if (response.requestSucceeded === false) {
        setFlowError({
          title: strings.CONNECT_FAILED,
          text: strings.UNABLE_TO_CONNECT_TO_SENSOR_KIT,
          buttonText: strings.TRY_AGAIN,
          onClick: connect,
        });
        return;
      }
      setPollingStartedOn(Date.now());
      setKeepPolling(true);
    };

    connect();
  }, [deviceManager, seedBank, pollingStartedOn, setKeepPolling]);

  useEffect(() => {
    if (!active) {
      return;
    }
    if (seedBank.connectionState === 'Not Connected') {
      setInitialized(true);
      connectAndWaitForDeviceManager();
    } else {
      onNext();
    }
  }, [seedBank, active, onNext, connectAndWaitForDeviceManager, deviceManager]);

  return (
    <FlowStep
      flowState='DeviceManager'
      active={active && initialized}
      showNext={updateFinished}
      flowError={flowError}
      onNext={onNext}
      title={strings.SENSOR_KIT_SET_UP_DEVICE_MANAGER}
      completed={completed}
      footer={
        <div className={classes.installDeviceManager}>
          {updateFinished && <span>{strings.DOWNLOAD_COMPLETE}</span>}
          {!updateFinished && pollingStartedOn > 0 && flowError === undefined && (
            <div className={classes.spinnerContainer}>
              <CircularProgress value={progressPercentage} />
              <span className={classes.downloadInProgress}>{strings.DOWNLOAD_IN_PROGRESS}</span>
            </div>
          )}
          {!updateFinished && (flowError !== undefined || !pollingStartedOn) && (
            <span>{strings.WAITING_TO_DOWNLOAD}</span>
          )}
        </div>
      }
    >
      <div>{strings.SENSOR_KIT_SET_UP_DEVICE_MANAGER_DESCRIPTION}</div>
    </FlowStep>
  );
}
