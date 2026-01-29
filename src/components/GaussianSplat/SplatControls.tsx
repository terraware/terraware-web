import React, { useCallback, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import { useApp } from '@playcanvas/react/hooks';
import { CameraComponent, XRSPACE_LOCALFLOOR, XRTYPE_AR, XRTYPE_VR } from 'playcanvas';

import { useLocalization } from 'src/providers';
import useSnackbar from 'src/utils/useSnackbar';

import Button from '../common/button/Button';

const SplatControls = () => {
  const { strings } = useLocalization();
  const app = useApp();
  const [isArAvailable, setIsArAvailable] = useState(false);
  const [isVrAvailable, setIsVrAvailable] = useState(false);
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
      app.xr?.start(app.root.findComponent('camera') as CameraComponent, XRTYPE_AR, XRSPACE_LOCALFLOOR, {
        callback: errorCallback,
      }),
    [app, errorCallback]
  );

  const handleVr = useCallback(
    () =>
      app.xr?.start(app.root.findComponent('camera') as CameraComponent, XRTYPE_VR, XRSPACE_LOCALFLOOR, {
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

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      {isArAvailable && <Button label={strings.AR} onClick={handleAr} />}
      {isVrAvailable && <Button label={strings.VR} onClick={handleVr} />}
    </Box>
  );
};

export default SplatControls;
