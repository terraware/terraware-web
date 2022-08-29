import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';
import strings from 'src/strings';
import { getLatestAppVersion } from 'src/api/appVersion';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { Message, Button } from '@terraware/web-components';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    margin: `${theme.spacing(2)} auto`,
  },
}));

const ONE_MINUTE_INTERVAL_MS = 60 * 1000;

type DetectAppVersionProps = {
  onNewVersion?: () => void;
};

export default function DetectAppVersion({ onNewVersion }: DetectAppVersionProps): JSX.Element | null {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles();
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [needsRefresh, setNeedsRefresh] = useState<boolean>(false);
  const currentAppVersion = process.env.REACT_APP_TERRAWARE_FE_BUILD_VERSION;

  const checkVersion = useCallback(async () => {
    const response = await getLatestAppVersion();
    const isStale = !!response.version && response.version.trim() !== currentAppVersion;
    setNeedsRefresh(isStale);
    if (isStale && onNewVersion) {
      onNewVersion();
    }
    // this is needed to trigger the next useEffect, so we keep checking for app version
    // (unless we have already decided app needs refresh)
    setLastCheck(Date.now());
  }, [currentAppVersion, onNewVersion]);

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
    <div className={classes.container}>
      <Message
        type='page'
        body={isMobile ? strings.NEW_APP_VERSION_MOBILE : strings.NEW_APP_VERSION}
        priority='info'
        pageButtons={[
          <Button
            label={strings.REFRESH}
            onClick={() => window.location.reload()}
            size='small' key={'1'}
            priority='secondary'
            type='passive' />,
        ]}
      />
    </div>
  );
}
