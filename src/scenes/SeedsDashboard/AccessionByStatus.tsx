import React, { type JSX } from 'react';
import { Link } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';

import TwLink from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers/hooks';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

interface Props {
  label: string;
  status: string;
  quantity: number | undefined;
}

export default function AccessionByStatus({ label, status, quantity }: Props): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const numberFormatter = useNumberFormatter(activeLocale);

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
            {numberFormatter.format(quantity ?? 0)}
          </Typography>
        </TwLink>
        <Typography color={theme.palette.TwClrTxt} fontSize='16px' fontWeight={500}>
          {label}
        </Typography>
      </Box>
    </Link>
  );
}
