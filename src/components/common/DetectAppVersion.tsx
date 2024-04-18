import React, { useEffect } from 'react';

import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, Message } from '@terraware/web-components';

import { selectIsAppVersionStale } from 'src/redux/features/appVersion/appVersionSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    margin: `${theme.spacing(2)} auto`,
  },
}));

type DetectAppVersionProps = {
  onNewVersion?: () => void;
};

export default function DetectAppVersion({ onNewVersion }: DetectAppVersionProps): JSX.Element | null {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles();
  const isStale = useAppSelector(selectIsAppVersionStale);

  useEffect(() => {
    if (isStale && onNewVersion) {
      onNewVersion();
    }
  }, [isStale, onNewVersion]);

  if (!isStale) {
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
            size='small'
            key={'1'}
            priority='secondary'
            type='passive'
          />,
        ]}
      />
    </div>
  );
}
