import React, { useEffect, useRef } from 'react';

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
    backgroundColor: theme.palette.TwClrBrdrTertiary,
  };

  useEffect(() => {
    const handleScroll = (event: Event) => {
      if (visible && paneRef.current && !paneRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (visible && paneRef.current && !paneRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      window.addEventListener('wheel', handleScroll, true);
      window.addEventListener('mousedown', handleMouseDown, true);
    }

    return () => {
      window.removeEventListener('wheel', handleScroll, true);
      window.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, [visible, onClose]);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
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
            pointerEvents: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ fontWeight: 600 }}>Controls</Typography>

            <Box sx={controlRowSx}>
              <Typography>Annotations</Typography>
              <Checkbox defaultChecked sx={{ color: theme.palette.primary.main }} />
            </Box>

            <Divider sx={dividerSx} />

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
              <Typography>Fly</Typography>
              <Box sx={rightAlignedTextSx}>
                <Typography>WASD</Typography>
                <Typography>Arrow Keys</Typography>
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

            <Divider sx={dividerSx} />
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export default ControlsInfoPane;
