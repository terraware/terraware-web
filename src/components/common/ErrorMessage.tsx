import { Box, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Icon } from '@terraware/web-components';

const useStyles = makeStyles((theme: Theme) => ({
  errorIcon: {
    fill: theme.palette.TwClrTxtDanger,
  },
}));

type ErrorMessageProps = {
  message: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps): JSX.Element | null {
  const theme = useTheme();
  const classes = useStyles();

  if (!message) {
    return null;
  }

  return (
    <Box display='flex' flexDirection='row' alignItems='center'>
      <Icon name='error' className={classes.errorIcon} />
      <Typography marginLeft={1} fontWeight={500} fontSize='14px' color={theme.palette.TwClrTxtDanger}>
        {message}
      </Typography>
    </Box>
  );
}
