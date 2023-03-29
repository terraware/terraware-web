import { Box, CircularProgress, useTheme } from '@mui/material';
import hexRgb from 'hex-rgb';

type BusySpinnerProps = {
  withSkrim?: boolean;
};

export default function BusySpinner({ withSkrim }: BusySpinnerProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: withSkrim
          ? `${hexRgb(`${theme.palette.TwClrBaseGray025}`, { alpha: 0.6, format: 'css' })}`
          : 'none',
        zIndex: 2000,
        backgroundImage:
          'linear-gradient(180deg,' +
          `${hexRgb(`${theme.palette.TwClrBaseGreen050}`, { alpha: 0, format: 'css' })} 0%,` +
          `${hexRgb(`${theme.palette.TwClrBaseGreen050}`, { alpha: 0.24, format: 'css' })} 100%)`,
      }}
    >
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        padding={theme.spacing(5)}
        flexDirection='column'
        height='100%'
      >
        <CircularProgress />
      </Box>
    </Box>
  );
}
