import { makeStyles } from '@mui/styles';
import ProgressCircle from 'src/components/common/ProgressCircle/ProgressCircle';
import React, { useCallback, useEffect, useState } from 'react';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { DeviceManager } from 'src/types/DeviceManager';
import FlowStep, { FlowError } from './FlowStep';
import { connectDeviceManager, getDeviceManager } from 'src/api/deviceManager/deviceManager';
import getHelpEmail from 'src/components/common/HelpEmail';
import { Theme } from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  installDeviceManager: {
    width: (props: StyleProps) => (props.isMobile ? '100%' : '432px'),
    fontStyle: 'italic',
  },
  spinnerContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  downloadInProgress: {
    marginLeft: theme.spacing(2),
  },
}));

type InstallDeviceManagerProps = {
  seedBank: Facility;
  deviceManager?: DeviceManager;
  active: boolean;
  completed: boolean | undefined;
  onNext: () => void;
  reloadData: () => void;
};

export default function InstallDeviceManager(props: InstallDeviceManagerProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const { seedBank, active, completed, onNext, deviceManager, reloadData } = props;
  const [flowError, setFlowError] = useState<FlowError | undefined>();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [updateFinished, setUpdateFinished] = useState<boolean>(false);
  const [pollingStartedOn, setPollingStartedOn] = useState<number>(0);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [keepPolling, setKeepPolling] = useState<boolean>(false);

  const formatEmailErrorMessage = (message: string): string => {
    return strings.formatString(message, getHelpEmail()) as string;
  };

  const checkDeviceManagerProgress = useCallback(
    (sanityCheck: any) => {
      const checkProgress = async () => {
        setKeepPolling(false);
        const response = await getDeviceManager(deviceManager!.id);
        if (response.manager === undefined) {
          if (!initialized) {
            setInitialized(true); // for sanity check, show error and stop
          }
          setFlowError({
            title: strings.CONNECT_FAILED,
            text: formatEmailErrorMessage(strings.UNABLE_TO_CONNECT_TO_SENSOR_KIT),
          });
          return;
        }

        const {
          manager: { updateProgress },
        } = response;
        if (updateProgress === undefined || updateProgress === 100) {
          if (sanityCheck) {
            onNext();
          } else {
            setUpdateFinished(true);
          }
          return;
        } else {
          setProgressPercentage(updateProgress);
          if (!initialized) {
            setInitialized(true); // for sanity check, now wait for progress to complete
          }
        }

        // if we have polled for over 20 minutes, stop and error out
        const currentTime = Date.now();
        if (pollingStartedOn && currentTime - pollingStartedOn >= 20 * 60 * 1000) {
          setFlowError({
            title: strings.DOWNLOAD_FAILED,
            text: formatEmailErrorMessage(strings.DOWNLOAD_FAILED_DESCRIPTION),
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
    },
    [deviceManager, pollingStartedOn, onNext, initialized]
  );

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
          text: formatEmailErrorMessage(strings.UNABLE_TO_CONNECT_TO_SENSOR_KIT),
          buttonText: strings.TRY_AGAIN,
          onClick: connect,
        });
        return;
      }
      reloadData(); // update connection state of seed bank, don't wait until user clicks Next
      setPollingStartedOn(Date.now());
      setKeepPolling(true);
    };

    connect();
  }, [deviceManager, seedBank, pollingStartedOn, setKeepPolling, reloadData]);

  useEffect(() => {
    // reinitialize if seed bank id changes
    setFlowError(undefined);
    setInitialized(false);
    setUpdateFinished(false);
    setPollingStartedOn(0);
    setProgressPercentage(0);
    setKeepPolling(false);
  }, [seedBank.id]);

  useEffect(() => {
    if (!active || pollingStartedOn || initialized) {
      return;
    }
    if (seedBank.connectionState === 'Not Connected') {
      setInitialized(true);
      connectAndWaitForDeviceManager();
    } else if (deviceManager) {
      setPollingStartedOn(Date.now());
      checkDeviceManagerProgress(true);
    } else {
      onNext();
    }
  }, [
    initialized,
    seedBank.connectionState,
    active,
    checkDeviceManagerProgress,
    connectAndWaitForDeviceManager,
    pollingStartedOn,
    onNext,
    deviceManager,
  ]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    if (keepPolling) {
      setFlowError(undefined);
      timeout = setTimeout(checkDeviceManagerProgress, 5 * 1000);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [keepPolling, checkDeviceManagerProgress]);

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
              <ProgressCircle size='small' determinate={true} value={progressPercentage} />
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
