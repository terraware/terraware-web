import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Box, IconButton, useTheme } from '@mui/material';
import { useApp } from '@playcanvas/react/hooks';
import { Icon } from '@terraware/web-components';
import { CameraComponent, XRSPACE_LOCAL, XRTYPE_AR, XRTYPE_VR } from 'playcanvas';

import useBoolean from 'src/hooks/useBoolean';
import { useCameraPosition } from 'src/hooks/useCameraPosition';
import { useLocalization } from 'src/providers';
import { getRgbaFromHex } from 'src/utils/color';
import useSnackbar from 'src/utils/useSnackbar';

import Button from '../common/button/Button';
import ControlsInfoPane from './ControlsInfoPane';

export interface SplatControlsProps {
  defaultCameraPosition?: [number, number, number];
  defaultCameraFocus?: [number, number, number];
  showAnnotations?: boolean;
  onToggleAnnotations?: (show: boolean) => void;
  autoRotate?: boolean;
  onToggleAutoRotate?: (enabled: boolean) => void;
  isEdit?: boolean;
  onToggleEdit?: (isEdit: boolean) => void;
}

const SplatControls = ({
  defaultCameraPosition,
  defaultCameraFocus,
  showAnnotations,
  onToggleAnnotations,
  autoRotate,
  onToggleAutoRotate,
  isEdit,
  onToggleEdit,
}: SplatControlsProps) => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const app = useApp();
  const { setCamera } = useCameraPosition();
  const [isArAvailable, setIsArAvailable] = useState(false);
  const [isVrAvailable, setIsVrAvailable] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useBoolean(true);
  const snackbar = useSnackbar();
  const paneRef = useRef<HTMLDivElement>(null);
  const infoButtonRef = useRef<HTMLButtonElement>(null);

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

    // Check current availability state on mount
    if (app.xr?.isAvailable(XRTYPE_VR)) {
      setIsVrAvailable(true);
    }
    if (app.xr?.isAvailable(XRTYPE_AR)) {
      setIsArAvailable(true);
    }

    app.xr?.on('available', handleAvailable);
    return () => {
      app.xr?.off('available', handleAvailable);
    };
  }, [app]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'r' || event.key === 'R') {
        if (defaultCameraFocus) {
          setCamera(defaultCameraFocus, defaultCameraPosition);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [defaultCameraFocus, defaultCameraPosition, setCamera]);

  const handleInfo = useCallback(() => {
    setIsInfoVisible((prev) => !prev);
  }, [setIsInfoVisible]);

  useEffect(() => {
    const handleScroll = (event: Event) => {
      if (isInfoVisible && paneRef.current && !paneRef.current.contains(event.target as Node)) {
        setIsInfoVisible(false);
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickOnInfoButton = infoButtonRef.current?.contains(target);
      if (isInfoVisible && paneRef.current && !paneRef.current.contains(target) && !isClickOnInfoButton) {
        setIsInfoVisible(false);
      }
    };

    if (isInfoVisible) {
      window.addEventListener('wheel', handleScroll, true);
      window.addEventListener('mousedown', handleMouseDown, true);
    }

    return () => {
      window.removeEventListener('wheel', handleScroll, true);
      window.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, [isInfoVisible, setIsInfoVisible, infoButtonRef]);

  const toggleEdit = useCallback(() => onToggleEdit?.(!isEdit), [isEdit, onToggleEdit]);

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
        {isArAvailable && !isEdit && <Button label={strings.AR} onClick={handleAr} />}
        {isVrAvailable && !isEdit && <Button label={strings.VR} onClick={handleVr} />}
        {onToggleEdit && <Button label={isEdit ? strings.SAVE : strings.EDIT} onClick={toggleEdit} />}
      </Box>
      <IconButton
        ref={infoButtonRef}
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
      <ControlsInfoPane
        visible={isInfoVisible}
        paneRef={paneRef}
        showAnnotations={showAnnotations}
        onToggleAnnotations={onToggleAnnotations}
        autoRotate={autoRotate}
        onToggleAutoRotate={onToggleAutoRotate}
      />
    </Box>
  );
};

export default SplatControls;
