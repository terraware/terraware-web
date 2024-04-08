import { Link } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';

import TwLink from 'src/components/common/Link';
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
      to={`${APP_PATHS.ACCESSIONS}?accessions_filter_state=${status}`}
      style={{
        textDecoration: 'none',
        padding: '22px 10px 40px 10px',
        width: isMobile ? '100%' : '33%',
        margin: '12px',
      }}
    >
      <Box textAlign='center'>
        <TwLink
          onClick={() => {
            return;
          }}
        >
          <Typography color={theme.palette.TwClrTxtBrand} fontSize='36px' fontWeight={600}>
            {quantity}
          </Typography>
        </TwLink>
        <Typography color={theme.palette.TwClrTxt} fontSize='16px' fontWeight={500}>
          {label}
        </Typography>
      </Box>
    </Link>
  );
}
