import { Box, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface Props {
  label: string;
  status: string;
  quantity: number | undefined;
}

export default function AccessionByStatus({ label, status, quantity }: Props): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  return (
    <Link
      id={`update-${status}`}
      to={`${APP_PATHS.ACCESSIONS}?stage=${status}`}
      style={{
        textDecoration: 'none',
        padding: '22px 10px 40px 10px',
        width: isMobile ? '100%' : '20%',
        borderRadius: '10px',
        border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        margin: '12px',
      }}
    >
      <Box textAlign='center'>
        <Typography color={theme.palette.TwClrTxtBrand} fontSize='36px'>
          {quantity}
        </Typography>
        <Typography color={theme.palette.TwClrTxt} fontSize='16px'>
          {label}
        </Typography>
      </Box>
    </Link>
  );
}
