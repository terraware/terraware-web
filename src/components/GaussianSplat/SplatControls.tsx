import React, { useCallback } from 'react';

import { Box } from '@mui/material';
import { useApp } from '@playcanvas/react/hooks';
import { CameraComponent, XRSPACE_LOCALFLOOR, XRTYPE_AR, XRTYPE_VR } from 'playcanvas';

import { useLocalization } from 'src/providers';

import Button from '../common/button/Button';

const SplatControls = () => {
  const { strings } = useLocalization();
  const app = useApp();

  const handleAr = useCallback(
    () => app.xr?.start(app.root.findComponent('camera') as CameraComponent, XRTYPE_AR, XRSPACE_LOCALFLOOR),
    [app]
  );

  const handleVr = useCallback(
    () => app.xr?.start(app.root.findComponent('camera') as CameraComponent, XRTYPE_VR, XRSPACE_LOCALFLOOR),
    [app]
  );

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      {app.xr?.isAvailable(XRTYPE_AR) && <Button label={strings.AR} onClick={handleAr} />}
      {app.xr?.isAvailable(XRTYPE_VR) && <Button label={strings.VR} onClick={handleVr} />}
    </Box>
  );
};

export default SplatControls;
