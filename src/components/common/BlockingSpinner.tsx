import { CircularProgress, StyledEngineProvider, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  spinner: {
    height: '200px',
    width: '200px',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    '& .MuiCircularProgress-svg': {
      color: theme.palette.TwClrIcnBrand,
      height: '200px',
      width: '200px',
    },
  },
}));

export default function BlockingSpinner(): JSX.Element {
  const classes = useStyles();

  return (
    <StyledEngineProvider injectFirst>
      <CircularProgress className={classes.spinner} size='193' />
    </StyledEngineProvider>
  );
}
