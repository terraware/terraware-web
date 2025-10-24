import React, { useCallback, useMemo, useRef } from 'react';
import { MapRef } from 'react-map-gl/mapbox';

import { Box, IconButton, Typography } from '@mui/material';
import { Icon } from '@terraware/web-components';
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
        <Box
          alignItems='center'
          display='flex'
          flexDirection='row'
          justifyContent='space-between'
          marginBottom='24px'
          width='100%'
        >
          <Box alignItems='center' display='flex' flexDirection='row' justifyContent='flex-start'>
            <Typography fontSize='24px' fontWeight={600}>
              {title}
            </Typography>

            <Typography>TODO: render quarter dropdown</Typography>
          </Box>

          <IconButton onClick={onClose}>
            <Icon name='close' size='medium' />
          </IconButton>
        </Box>

        <MapSplitView
          activities={[]}
          // activityMarkerHighlighted={activityMarkerHighlighted}
          drawerRef={mapDrawerRef}
          heightOffsetPx={204}
          // heightOffsetPx={overrideHeightOffsetPx ?? 256}
          mapRef={mapRef}
          // onActivityMarkerClick={onActivityMarkerClick}
          projectId={projectId}
        >
          <Typography>TODO: render activity highlights</Typography>
        </MapSplitView>
      </DialogBox>
    </Box>
  );
};

export default ActivityHighlightsModal;
