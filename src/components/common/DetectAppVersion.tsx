import React, { type JSX, createContext, useContext, useEffect } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button, Message } from '@terraware/web-components';

import { useAppVersion } from 'src/hooks/useAppVersion';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const AppVersionBannerContext = createContext(false);

export const AppVersionBannerProvider = ({ children }: { children?: React.ReactNode }): JSX.Element => (
  <AppVersionBannerContext.Provider value={true}>{children}</AppVersionBannerContext.Provider>
);

export const useIsAppVersionBannerRendered = (): boolean => useContext(AppVersionBannerContext);

type DetectAppVersionProps = {
  onNewVersion?: () => void;
};

export default function DetectAppVersion({ onNewVersion }: DetectAppVersionProps): JSX.Element | null {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const { isStale } = useAppVersion();

  useEffect(() => {
    if (isStale && onNewVersion) {
      onNewVersion();
    }
  }, [isStale, onNewVersion]);

  if (!isStale) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        marginBottom: theme.spacing(2),
      }}
    >
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
    </Box>
  );
}
