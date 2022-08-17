import { Box, Typography } from '@mui/material';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface Props {
  status: string;
  quantity: number | undefined;
}

export default function AccessionByStatus({ status, quantity }: Props): JSX.Element {
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
      <Typography color='#0067C8' fontSize='36px'>
        {quantity}
      </Typography>
      <Typography color='#000000' fontSize='16px'>
        {status}
      </Typography>
    </Box>
  );
}
