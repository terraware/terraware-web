import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { AccessionState } from 'src/api/types/accessions';
import { APP_PATHS } from 'src/constants';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface Props {
  label: string;
  status: AccessionState;
  quantity: number | undefined;
}

export default function AccessionByStatus({ label, status, quantity }: Props): JSX.Element {
  const { isMobile } = useDeviceInfo();
  return (
    <Box
      borderRadius='10px'
      border='1px solid #E5E5E5'
      margin='12px'
      textAlign='center'
      width={isMobile ? '100%' : '20%'}
      padding='22px 10px 40px 10px'
    >
      <Link id={`update-${status}`} to={`${APP_PATHS.ACCESSIONS}?stage=${status}`} style={{ textDecoration: 'none' }}>
        <Typography color='#0067C8' fontSize='36px'>
          {quantity}
        </Typography>
      </Link>
      <Typography color='#000000' fontSize='16px'>
        {label}
      </Typography>
    </Box>
  );
}
