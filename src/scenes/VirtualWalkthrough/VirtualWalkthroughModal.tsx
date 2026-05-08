import React, { useCallback, useEffect, useState } from 'react';

import { Close } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { OverlayModal } from '@terraware/web-components';

import Application from 'src/components/GaussianSplat/Application';

import VirtualWalkthroughViewer, { VirtualWalkthroughViewerProps } from './VirtualWalkthroughViewer';

type VirtualWalkthroughModalProps = Omit<VirtualWalkthroughViewerProps, 'isFullScreen' | 'onToggleFullScreen'> & {
  onClose?: () => void;
  belowComponent?: React.ReactNode;
};

const VirtualWalkthroughModal = ({ onClose, belowComponent, ...viewerProps }: VirtualWalkthroughModalProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleToggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isFullScreen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen, onClose]);

  if (isFullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#EAF8FF',
          zIndex: 9999,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'white',
            boxShadow: 2,
            zIndex: 1,
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
          aria-label='Close'
        >
          <Close />
        </IconButton>
        <Application style={{ width: '100%', height: '100%', display: 'block' }}>
          <VirtualWalkthroughViewer {...viewerProps} isFullScreen={true} onToggleFullScreen={handleToggleFullScreen} />
        </Application>
      </Box>
    );
  }

  return (
    <OverlayModal open={true} onClose={onClose} belowComponent={belowComponent}>
      <Application style={{ width: '100%', height: '100%', display: 'block', margin: '0 auto' }}>
        <VirtualWalkthroughViewer {...viewerProps} isFullScreen={false} onToggleFullScreen={handleToggleFullScreen} />
      </Application>
    </OverlayModal>
  );
};

export default VirtualWalkthroughModal;
