import React, { useEffect, useRef } from 'react';

import { Box, Checkbox, Divider, Fade, Typography, useTheme } from '@mui/material';

import { useLocalization } from 'src/providers';

interface ControlsInfoPaneProps {
  visible: boolean;
  onClose: () => void;
}

const ControlsInfoPane = ({ visible, onClose }: ControlsInfoPaneProps) => {
  const theme = useTheme();
  const { strings } = useLocalization();
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
            <Typography sx={{ fontWeight: 600 }}>{strings.CONTROLS}</Typography>

            <Box sx={controlRowSx}>
              <Typography>{strings.ANNOTATIONS}</Typography>
              <Checkbox defaultChecked sx={{ color: theme.palette.primary.main }} />
            </Box>

            <Divider sx={dividerSx} />

            <Box sx={controlRowSx}>
              <Typography>{strings.ORBIT}</Typography>
              <Box sx={rightAlignedTextSx}>
                <Typography>{strings.LEFT_MOUSE}</Typography>
                <Typography>{strings.TOUCH_DRAG}</Typography>
              </Box>
            </Box>

            <Divider sx={dividerSx} />

            <Box sx={controlRowSx}>
              <Typography>{strings.PAN}</Typography>
              <Box sx={rightAlignedTextSx}>
                <Typography>{strings.MIDDLE_MOUSE}</Typography>
                <Typography>{strings.SWIPE}</Typography>
              </Box>
            </Box>

            <Divider sx={dividerSx} />

            <Box sx={controlRowSx}>
              <Typography>{strings.LOOK}</Typography>
              <Typography>{strings.RIGHT_MOUSE}</Typography>
            </Box>

            <Divider sx={dividerSx} />

            <Box sx={controlRowSx}>
              <Typography>{strings.ZOOM}</Typography>
              <Box sx={rightAlignedTextSx}>
                <Typography>{strings.MOUSE_WHEEL}</Typography>
                <Typography>{strings.PINCH}</Typography>
              </Box>
            </Box>

            <Divider sx={dividerSx} />

            <Box sx={controlRowSx}>
              <Typography>{strings.FLY}</Typography>
              <Box sx={rightAlignedTextSx}>
                <Typography>WASD</Typography>
                <Typography>{strings.ARROW_KEYS}</Typography>
              </Box>
            </Box>

            <Divider sx={dividerSx} />

            <Box sx={controlRowSx}>
              <Typography>{strings.FLY_FASTER}</Typography>
              <Typography>{strings.SHIFT}</Typography>
            </Box>

            <Divider sx={dividerSx} />

            <Box sx={controlRowSx}>
              <Typography>{strings.FLY_SLOWER}</Typography>
              <Typography>{strings.CTRL}</Typography>
            </Box>

            <Divider sx={dividerSx} />

            <Box sx={controlRowSx}>
              <Typography>{strings.RESET_CAMERA}</Typography>
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
