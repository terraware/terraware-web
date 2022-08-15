import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@mui/styles';
import { Slide, Theme } from '@mui/material';
import strings from 'src/strings';
import { getLatestAppVersion } from 'src/api/appVersion';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageMessage from './PageMessage';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    margin: `${theme.spacing(2)} auto`,
  },
}));

const ONE_MINUTE_INTERVAL_MS = 60 * 1000;

export default function DetectAppVersion(): JSX.Element | null {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles();
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [needsRefresh, setNeedsRefresh] = useState<boolean>(false);
  const currentAppVersion = process.env.REACT_APP_TERRAWARE_FE_BUILD_VERSION;

  const checkVersion = useCallback(async () => {
    const response = await getLatestAppVersion();
    const isStale = !!response.version && response.version.trim() !== currentAppVersion;
    setNeedsRefresh(isStale);
    // this is needed to trigger the next useEffect, so we keep checking for app version
    // (unless we have already decided app needs refresh)
    setLastCheck(Date.now());
  }, [currentAppVersion]);

  useEffect(() => {
    let timeoutVar: any = null;
    if (lastCheck === 0) {
      checkVersion();
      return;
    }
    if (!needsRefresh) {
      timeoutVar = setTimeout(async () => {
        await checkVersion();
      }, ONE_MINUTE_INTERVAL_MS);
    }
    return () => clearTimeout(timeoutVar);
  }, [checkVersion, lastCheck, needsRefresh]);

  if (!needsRefresh) {
    return null;
  }

  return (
    <Slide in={true} direction='down' className={classes.container}>
      <div>
        <PageMessage
          message={isMobile ? strings.NEW_APP_VERSION_MOBILE : strings.NEW_APP_VERSION}
          priority={'info'}
          buttonText={strings.REFRESH}
          onClick={() => window.location.reload()}
        />
      </div>
    </Slide>
  );
}
