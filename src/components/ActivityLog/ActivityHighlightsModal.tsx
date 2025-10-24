import React, { useCallback, useMemo, useRef } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, Typography } from '@mui/material';
import DialogBox, { DialogBoxSize } from '@terraware/web-components/components/DialogBox/DialogBox';
import { useDeviceInfo } from '@terraware/web-components/utils';

import MapSplitView from './MapSplitView';

type ActivityHighlightsModalProps = {
  onCancel?: () => void;
  open: boolean;
  projectId: number;
  setOpen: (open: boolean) => void;
  title?: string;
};

const ActivityHighlightsModal = ({ open, setOpen, onCancel, projectId, title = '' }: ActivityHighlightsModalProps) => {
  const { isMobile, isTablet } = useDeviceInfo();
  const mapDrawerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);

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
    <Box
      sx={{
        '& .dialog-box': { minHeight: '90vh', minWidth: '96vw' },
        '& .dialog-box--header': { display: 'none' },
      }}
    >
      <DialogBox onClose={onClose} open={open} size={dialogSize} skrim title={title}>
        <Box display='flex' flexDirection='row' justifyContent='flex-start' alignItems='center'>
          <Typography fontSize='24px' fontWeight={600} marginBottom='24px'>
            {title}
          </Typography>
          {/* TODO: render quarter dropdown here */}
          {/* TODO: render close modal button (use 'x' icon) */}
        </Box>

        <MapSplitView
          activities={[]}
          // activityMarkerHighlighted={activityMarkerHighlighted}
          drawerRef={mapDrawerRef}
          mapRef={mapRef}
          // heightOffsetPx={overrideHeightOffsetPx ?? 256}
          heightOffsetPx={204}
          // onActivityMarkerClick={onActivityMarkerClick}
          projectId={projectId}
        >
          <p>TODO: render activity highlights</p>
        </MapSplitView>
      </DialogBox>
    </Box>
  );
};

export default ActivityHighlightsModal;
