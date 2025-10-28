import React, { useCallback, useMemo } from 'react';

import { Box, IconButton, Typography } from '@mui/material';
import { Icon } from '@terraware/web-components';
import DialogBox, { DialogBoxSize } from '@terraware/web-components/components/DialogBox/DialogBox';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { Activity } from 'src/types/Activity';

import ActivityHighlightsView from './ActivityHighlightsView';

const containerStyles = {
  '& .dialog-box': {
    minHeight: '90vh',
    minWidth: '96vw',
  },
  '& .dialog-box--header': {
    display: 'none',
  },
};

type ActivityHighlightsModalProps = {
  activities: Activity[];
  onCancel?: () => void;
  open: boolean;
  projectId: number;
  setOpen: (open: boolean) => void;
  title?: string;
};

const ActivityHighlightsModal = ({
  activities,
  open,
  setOpen,
  onCancel,
  projectId,
  title = '',
}: ActivityHighlightsModalProps) => {
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
    <Box sx={containerStyles}>
      <DialogBox onClose={onClose} open={open} size={dialogSize} skrim title={title}>
        <Box>
          <Box
            alignItems='center'
            display='flex'
            flexDirection='row'
            justifyContent='space-between'
            marginBottom='24px'
            width='100%'
          >
            <Box alignItems='center' display='flex' flexDirection='row' justifyContent='flex-start'>
              <Typography fontSize='24px' fontWeight={600} paddingRight='24px'>
                {title}
              </Typography>

              <Typography>TODO: render quarter dropdown</Typography>
            </Box>

            <IconButton onClick={onClose}>
              <Icon name='close' size='medium' />
            </IconButton>
          </Box>

          <ActivityHighlightsView activities={activities} projectId={projectId} />
        </Box>
      </DialogBox>
    </Box>
  );
};

export default ActivityHighlightsModal;
