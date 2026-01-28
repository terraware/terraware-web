import React, { useCallback, useEffect, useState } from 'react';

import { Box, IconButton, useTheme } from '@mui/material';
import { useApp } from '@playcanvas/react/hooks';
import { Icon } from '@terraware/web-components';
import { CameraComponent, XRSPACE_LOCAL, XRTYPE_AR, XRTYPE_VR } from 'playcanvas';

import useBoolean from 'src/hooks/useBoolean';
import { useLocalization } from 'src/providers';
import { getRgbaFromHex } from 'src/utils/color';
import useSnackbar from 'src/utils/useSnackbar';

import Button from '../common/button/Button';
import ControlsInfoPane from './ControlsInfoPane';

const SplatControls = () => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const app = useApp();
  const [isArAvailable, setIsArAvailable] = useState(false);
  const [isVrAvailable, setIsVrAvailable] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useBoolean(true);
  const snackbar = useSnackbar();

  const errorCallback = useCallback(
    (err: Error | null) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('error in xr', err);
        snackbar.toastError(strings.XR_ERROR);
        app.xr?.end();
      }
    },
    [app, snackbar, strings]
  );

  const handleAr = useCallback(
    () =>
      app.xr?.start(app.root.findComponent('camera') as CameraComponent, XRTYPE_AR, XRSPACE_LOCAL, {
        callback: errorCallback,
      }),
    [app, errorCallback]
  );

  const handleVr = useCallback(
    () =>
      app.xr?.start(app.root.findComponent('camera') as CameraComponent, XRTYPE_VR, XRSPACE_LOCAL, {
        callback: errorCallback,
      }),
    [app, errorCallback]
  );

  useEffect(() => {
    // this can't be changed to `useMemo(() => app.xr?.isAvailable(XRTYPE_AR), [app])` because `app` doesn't update when
    // XR's availability is updated
    const handleAvailable = (type: string, available: boolean) => {
      if (type === XRTYPE_VR) {
        setIsVrAvailable(available);
      } else if (type === XRTYPE_AR) {
        setIsArAvailable(available);
      }
    };

    app.xr?.on('available', handleAvailable);
    return () => {
      app.xr?.off('available', handleAvailable);
    };
  }, [app]);

  const handleInfo = useCallback(() => {
    setIsInfoVisible((prev) => !prev);
  }, [setIsInfoVisible]);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          pointerEvents: 'auto',
        }}
      >
        {isArAvailable && <Button label={strings.AR} onClick={handleAr} />}
        {isVrAvailable && <Button label={strings.VR} onClick={handleVr} />}
      </Box>
      <IconButton
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: getRgbaFromHex(theme.palette.TwClrIcnOnBrand as string, 0.9),
          '&:hover': { backgroundColor: getRgbaFromHex(theme.palette.TwClrIcnOnBrand as string, 1) },
          pointerEvents: 'auto',
        }}
        onClick={handleInfo}
      >
        <Icon name='info' size={'medium'} fillColor={theme.palette.TwClrIcnInfo} />
      </IconButton>
      <ControlsInfoPane visible={isInfoVisible} onClose={handleInfo} />
    </Box>
  );
};

export default SplatControls;
