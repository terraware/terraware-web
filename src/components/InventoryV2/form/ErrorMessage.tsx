import { Box, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ErrorBox } from '@terraware/web-components';

const useStyles = makeStyles(() => ({
  error: {
    '& .error-box--container': {
      alignItems: 'center',
      width: 'auto',
    },
    '&.error-box': {
      width: 'auto',
    },
  },
}));

export default function ErrorMessage({ errorMessage }: { errorMessage?: string }): JSX.Element | null {
  const classes = useStyles();
  const theme = useTheme();

  if (!errorMessage) {
    return null;
  }

  return (
    <Box display='flex' flexGrow={1} margin={theme.spacing(1, 0)}>
      <ErrorBox text={errorMessage} className={classes.error} />
    </Box>
  );
}
