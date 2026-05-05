import React from 'react';

import { OverlayModal } from '@terraware/web-components';

import Application from 'src/components/GaussianSplat/Application';

import VirtualWalkthroughViewer, { VirtualWalkthroughViewerProps } from './VirtualWalkthroughViewer';

type VirtualWalkthroughModalProps = VirtualWalkthroughViewerProps & {
  onClose?: () => void;
  belowComponent?: React.ReactNode;
};

const VirtualWalkthroughModal = ({ onClose, belowComponent, ...viewerProps }: VirtualWalkthroughModalProps) => {
  return (
    <OverlayModal open={true} onClose={onClose} belowComponent={belowComponent}>
      <Application style={{ width: '100%', height: '100%', display: 'block', margin: '0 auto' }}>
        <VirtualWalkthroughViewer {...viewerProps} />
      </Application>
    </OverlayModal>
  );
};

export default VirtualWalkthroughModal;
