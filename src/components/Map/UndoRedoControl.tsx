import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

export type UndoRedoBoundaryControlProps = {
  onRedo?: () => void;
  onUndo?: () => void;
};

const UndoRedoBoundaryControl = ({ onRedo, onUndo }: UndoRedoBoundaryControlProps): JSX.Element => {
  const theme = useTheme();

  const buttonStyles = {
    background: theme.palette.TwClrBaseWhite,
    color: theme.palette.TwClrTxt,
    '&:hover': {
      background: theme.palette.TwClrBaseWhite,
      color: theme.palette.TwClrTxt,
    },
    '&:focus': {
      outline: 'none',
    },
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '10px',
        right: '45px',
        zIndex: 10,
        height: 28,
        backgroundColor: `${theme.palette.TwClrBaseWhite}`,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Button icon='iconUndo' onClick={() => onUndo?.()} disabled={!onUndo} style={buttonStyles} />
      <Box width='1px' height='20px' border={`1px solid ${theme.palette.TwClrBgTertiary}`} />
      <Button icon='iconRedo' onClick={() => onRedo?.()} disabled={!onRedo} style={buttonStyles} />
    </Box>
  );
};

export default UndoRedoBoundaryControl;
