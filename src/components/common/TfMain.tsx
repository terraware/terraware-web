import React, { CSSProperties, type JSX } from 'react';

import { Box } from '@mui/material';

import DetectAppVersion, {
  AppVersionBannerProvider,
  useIsAppVersionBannerRendered,
} from 'src/components/common/DetectAppVersion';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface Props {
  backgroundImageVisible?: boolean;
  children?: React.ReactNode;
  style?: CSSProperties;
}

export default function TfMain({ children, style }: Props): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const isAppVersionBannerRendered = useIsAppVersionBannerRendered();

  return (
    <Box
      component='main'
      sx={{
        // TODO: uncomment this line when updating to the new green color theme
        // background: 'linear-gradient(180deg, #FBF9F9 0%, #EFF5EF 100%)',
        minHeight: '100vh',
        display: 'flex',
        padding: isMobile ? '32px 24px' : '32px',
        flexDirection: 'column',
        ...style,
      }}
    >
      {!isAppVersionBannerRendered && <DetectAppVersion />}
      <AppVersionBannerProvider>{children}</AppVersionBannerProvider>
    </Box>
  );
}
