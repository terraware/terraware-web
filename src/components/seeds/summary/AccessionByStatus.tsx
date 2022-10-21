import { Box, Theme, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { AccessionState } from 'src/api/types/accessions';
import { APP_PATHS } from 'src/constants';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    textDecoration: 'none',
    padding: '22px 10px 40px 10px',
    borderRadius: '10px',
    border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    margin: '12px',
  },
  quantity: { color: theme.palette.TwClrTxtBrand, fontSize: '36px' },
  label: { color: theme.palette.TwClrTxt, fontSize: '16px' },
}));

interface Props {
  label: string;
  status: AccessionState;
  quantity: number | undefined;
}

export default function AccessionByStatus({ label, status, quantity }: Props): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles();
  return (
    <Link
      className={classes.container}
      id={`update-${status}`}
      to={`${APP_PATHS.ACCESSIONS}?stage=${status}`}
      style={{
        width: isMobile ? '100%' : '20%',
      }}
    >
      <Box textAlign='center'>
        <Typography className={classes.quantity}>{quantity}</Typography>
        <Typography className={classes.label}>{label}</Typography>
      </Box>
    </Link>
  );
}
