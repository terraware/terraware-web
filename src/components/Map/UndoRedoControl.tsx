import { Box, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button } from '@terraware/web-components';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    background: theme.palette.TwClrBaseWhite,
    color: theme.palette.TwClrTxt,
    '&:hover': {
      background: theme.palette.TwClrBaseWhite,
      color: theme.palette.TwClrTxt,
    },
    '&:focus': {
      outline: 'none',
    },
  },
}));

export type UndoRedoBoundaryControlProps = {
  onRedo?: () => void;
  onUndo?: () => void;
};

const UndoRedoBoundaryControl = ({ onRedo, onUndo }: UndoRedoBoundaryControlProps): JSX.Element => {
  const classes = useStyles();
  const theme = useTheme();

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
      <Button className={classes.button} icon='iconUndo' onClick={() => onUndo?.()} disabled={!onUndo} />
      <Box width='1px' height='20px' border={`1px solid ${theme.palette.TwClrBgTertiary}`} />
      <Button className={classes.button} icon='iconRedo' onClick={() => onRedo?.()} disabled={!onRedo} />
    </Box>
  );
};

export default UndoRedoBoundaryControl;
