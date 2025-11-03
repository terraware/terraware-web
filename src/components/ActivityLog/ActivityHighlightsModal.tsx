import React, { useCallback, useMemo } from 'react';

import { Box } from '@mui/material';
import DialogBox, { DialogBoxSize } from '@terraware/web-components/components/DialogBox/DialogBox';
import { useDeviceInfo } from '@terraware/web-components/utils';

import useQuery from 'src/utils/useQuery';

import ActivityHighlightsContent from './ActivityHighlightsContent';
import { TypedActivity } from './types';

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
  activities: TypedActivity[];
  busy: boolean;
  onCancel?: () => void;
  open: boolean;
  projectId: number;
  setOpen: (open: boolean) => void;
  title?: string;
};

const ActivityHighlightsModal = ({
  activities,
  busy,
  open,
  setOpen,
  onCancel,
  projectId,
  title = '',
}: ActivityHighlightsModalProps) => {
  const { isMobile, isTablet } = useDeviceInfo();
  const query = useQuery();

  const highlightActivityId = useMemo(() => {
    const activityIdParam = query.get('highlightActivityId');
    return activityIdParam ? Number(activityIdParam) : undefined;
  }, [query]);

  const onClose = useCallback(() => {
    onCancel?.();
    setOpen(false);
  }, [onCancel, setOpen]);

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
      <DialogBox
        onClose={onClose}
        open={open}
        scrolled={highlightActivityId ? true : false}
        size={dialogSize}
        skrim
        title={title}
      >
        <ActivityHighlightsContent
          activities={activities}
          busy={busy}
          projectId={projectId}
          showCloseButton={true}
          onClose={onClose}
          title={title}
        />
      </DialogBox>
    </Box>
  );
};

export default ActivityHighlightsModal;
