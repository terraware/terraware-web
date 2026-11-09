import React, { type JSX } from 'react';

import { Box, CircularProgress, Grid, Typography, useTheme } from '@mui/material';

import PanelTitle from 'src/components/PanelTitle';
import Link from 'src/components/common/Link';
import Icon from 'src/components/common/icon/Icon';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { OrganizationNurserySummaryPayload } from 'src/queries/generated/nurserySummaries';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

type Props = {
  summary?: OrganizationNurserySummaryPayload;
  loading: boolean;
  error: boolean;
};

export default function SeedlingsByStage({ summary, loading, error }: Props): JSX.Element {
  const { strings } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();
  const stages = [
    { label: strings.GERMINATING, quantity: summary?.germinatingQuantity },
    { label: strings.ACTIVE_GROWTH, quantity: summary?.activeGrowthQuantity },
    { label: strings.HARDENING_OFF, quantity: summary?.hardeningOffQuantity },
    { label: strings.READY, quantity: summary?.readyQuantity },
  ];

  return (
    <Box
      component='section'
      aria-labelledby='seedlings-by-stage'
      sx={{ backgroundColor: theme.palette.TwClrBg, borderRadius: '24px', padding: theme.spacing(3) }}
    >
      <Box display='flex' alignItems='center' gap={1}>
        <Icon fillColor={theme.palette.TwClrIcnSecondary} name='futures' size='medium' />
        <PanelTitle id='seedlings-by-stage' title={strings.SEEDLINGS_BY_STAGE} />
      </Box>
      <Grid container spacing={3} marginBottom={theme.spacing(3.5)}>
        {stages.map((stage) => (
          <Grid key={stage.label} size={isMobile ? 12 : 3}>
            <Box component='section' aria-label={stage.label} textAlign='center' padding='22px 10px 40px'>
              {error ? (
                strings.GENERIC_ERROR
              ) : loading ? (
                <CircularProgress aria-label={stage.label} />
              ) : (
                <Typography fontSize='36px' fontWeight={600} color={theme.palette.TwClrTxt}>
                  {numberFormatter.format(stage.quantity)}
                </Typography>
              )}
              <Typography fontSize='16px' fontWeight={500} color={theme.palette.TwClrTxt}>
                {stage.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Link to={APP_PATHS.INVENTORY} fontSize='16px'>
        {strings.SEE_ALL_INVENTORY}
      </Link>
    </Box>
  );
}
