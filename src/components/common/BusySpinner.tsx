import { Box, CircularProgress, useTheme } from '@mui/material';

type BusySpinnerProps = {
  withSkrim?: boolean;
};

export default function BusySpinner({ withSkrim }: BusySpinnerProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: withSkrim ? theme.palette.TwClrBgBrandGhostHover : 'none',
        zIndex: 2000,
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
