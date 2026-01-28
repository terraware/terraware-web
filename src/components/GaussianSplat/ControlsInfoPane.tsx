import React, { useCallback, useEffect, useRef } from 'react';

import { Box, Checkbox, Divider, Fade, Typography, useTheme } from '@mui/material';

interface ControlsInfoPaneProps {
  visible: boolean;
  onClose: () => void;
}

const ControlsInfoPane = ({ visible, onClose }: ControlsInfoPaneProps) => {
  const theme = useTheme();
  const paneRef = useRef<HTMLDivElement>(null);

  const controlRowSx = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const rightAlignedTextSx = {
    textAlign: 'right',
  };

  const dividerSx = {
    backgroundColor: theme.palette.grey[700],
  };

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (paneRef.current && !paneRef.current.contains(event.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    const handleScroll = (event: Event) => {
      if (visible && paneRef.current && !paneRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      window.addEventListener('wheel', handleScroll, true);
    }

    return () => {
      window.removeEventListener('wheel', handleScroll, true);
    };
  }, [visible, onClose]);

  return (
    <Box
      onClick={handleBackdropClick}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: visible ? 'auto' : 'none',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        padding: 2,
        zIndex: 1001,
      }}
    >
      <Fade in={visible} timeout={500}>
        <Box
          ref={paneRef}
          sx={{
            backgroundColor: theme.palette.grey[900],
            color: theme.palette.common.white,
            borderRadius: 2,
            padding: 3,
            minWidth: 320,
            maxWidth: 400,
          }}
        >
          <Typography variant='h5' sx={{ marginBottom: 2 }}>
            Controls
          </Typography>

          <Box sx={{ ...controlRowSx, marginBottom: 1 }}>
            <Typography>Annotations</Typography>
            <Checkbox defaultChecked sx={{ color: theme.palette.primary.main }} />
          </Box>

          <Divider sx={{ ...dividerSx, marginY: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={controlRowSx}>
              <Typography>Orbit</Typography>
              <Box sx={rightAlignedTextSx}>
                <Typography>Left Mouse</Typography>
                <Typography>Touch + Drag</Typography>
              </Box>
            </Box>

            <Divider sx={dividerSx} />

            <Box sx={controlRowSx}>
              <Typography>Pan</Typography>
              <Box sx={rightAlignedTextSx}>
                <Typography>Middle Mouse</Typography>
                <Typography>Swipe</Typography>
              </Box>
            </Box>

            <Divider sx={dividerSx} />

            <Box sx={controlRowSx}>
              <Typography>Look</Typography>
              <Typography>Right Mouse</Typography>
            </Box>

            <Divider sx={dividerSx} />

            <Box sx={controlRowSx}>
              <Typography>Zoom</Typography>
              <Box sx={rightAlignedTextSx}>
                <Typography>Mouse Wheel</Typography>
                <Typography>Pinch</Typography>
              </Box>
            </Box>

            <Divider sx={dividerSx} />

            <Box sx={controlRowSx}>
              <Typography>Fly faster</Typography>
              <Typography>Shift</Typography>
            </Box>

            <Divider sx={dividerSx} />

            <Box sx={controlRowSx}>
              <Typography>Fly slower</Typography>
              <Typography>Ctrl</Typography>
            </Box>

            <Divider sx={dividerSx} />

            <Box sx={controlRowSx}>
              <Typography>Reset Camera</Typography>
              <Typography>R</Typography>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export default ControlsInfoPane;
