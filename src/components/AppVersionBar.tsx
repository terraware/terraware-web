import React, { useState, useEffect } from 'react';
import { Theme, Slide } from '@mui/material';
import strings from 'src/strings';
import { getLatestAppVersion } from 'src/api/appVersion';
import { makeStyles } from '@mui/styles';
import Button from './common/button/Button';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  isMobile: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: (props: StyleProps) => `${theme.spacing(1)} ${theme.spacing(props.isMobile ? 1 : 3)}`,
    backgroundImage: 'linear-gradient(45deg, darkgreen, lightgreen)',
    alignItems: 'center',
    color: '#ffffff',
  },
  refreshButton: {
    marginLeft: theme.spacing(1),
  },
}));

const ONE_MINUTE_INTERVAL_MS = 60 * 1000;

export default function AppVersionBar(): JSX.Element | null {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [needsRefresh, setNeedsRefresh] = useState<boolean>(false);
  const currentAppVersion = process.env.REACT_APP_TERRAWARE_FE_BUILD_VERSION;

  useEffect(() => {
    let timeoutVar: any = null;
    if (!needsRefresh) {
      timeoutVar = setTimeout(async () => {
        const response = await getLatestAppVersion();
        const isStale = !!response.version && response.version.trim() !== currentAppVersion;
        setNeedsRefresh(isStale);
        // this is needed to trigger the next useEffect, so we keep checking for app version
        // (unless we have already decided app needs refresh)
        setLastCheck(Date.now());
      }, ONE_MINUTE_INTERVAL_MS);
    }
    return () => clearTimeout(timeoutVar);
  }, [needsRefresh, currentAppVersion, lastCheck]);

  if (!needsRefresh) {
    return null;
  }

  return (
    <Slide in={true} direction='down'>
      <div className={classes.mainContainer}>
        <span>{isMobile ? strings.NEW_APP_VERSION_MOBILE : strings.NEW_APP_VERSION}</span>
        <Button
          className={classes.refreshButton}
          label={strings.REFRESH}
          icon={isMobile ? undefined : 'leaf'}
          onClick={() => window.location.reload()}
        />
      </div>
    </Slide>
  );
}
