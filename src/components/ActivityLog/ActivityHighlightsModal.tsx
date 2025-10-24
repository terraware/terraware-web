import React, { useCallback, useMemo } from 'react';

import { Box } from '@mui/material';
import DialogBox, { DialogBoxSize } from '@terraware/web-components/components/DialogBox/DialogBox';
import { useDeviceInfo } from '@terraware/web-components/utils';

type ActivityHighlightsModalProps = {
  onCancel?: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
};

const ActivityHighlightsModal = ({ open, setOpen, onCancel, title = '' }: ActivityHighlightsModalProps) => {
  const { isMobile, isTablet } = useDeviceInfo();

  const onClose = useCallback(() => {
    onCancel?.();
    setOpen(false);
  }, [setOpen, onCancel]);

  const dialogSize = useMemo((): DialogBoxSize => {
    if (isMobile) {
      return 'small';
    } else if (isTablet) {
      return 'large';
    } else {
      return 'xx-large';
    }
  }, [isMobile, isTablet]);

  return (
    <Box sx={{ '& .dialog-box': { minHeight: '90vh', minWidth: '96vw' } }}>
      <DialogBox onClose={onClose} open={open} scrolled size={dialogSize} skrim title={title}>
        <p>TODO: render highlights view content</p>
      </DialogBox>
    </Box>
  );
};

export default ActivityHighlightsModal;
