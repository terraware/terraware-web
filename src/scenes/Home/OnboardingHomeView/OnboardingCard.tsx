import React, { useMemo } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Icon, IconName } from '@terraware/web-components';
import { Props as ButtonProps } from '@terraware/web-components/components/Button/Button';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

import OnboardingCardItem, { OnboardingCardItemProps } from './OnboardingCardItem';

export type OnboardingCardRow = {
  buttonProps?: ButtonProps;
  icon: IconName;
  onboardingCardItems: OnboardingCardItemProps[];
  title: string;
};

type OnboardingCardProps = {
  rows: OnboardingCardRow[];
};

const OnboardingCard = ({ rows }: OnboardingCardProps): JSX.Element => {
  const { isDesktop, isMobile } = useDeviceInfo();
  const theme = useTheme();

  const primaryGridSize = useMemo(() => (isDesktop ? 3 : 12), [isDesktop]);

  return (
    <Box
      sx={{
        alignItems: 'center',
        background: theme.palette.TwClrBg,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px',
      }}
    >
      <Box sx={{ alignItems: 'left' }}>
        <Typography
          component='p'
          variant='h6'
          sx={{
            color: theme.palette.TwClrTxt,
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: '28px',
          }}
        >
          {strings.GET_STARTED}
        </Typography>
        <Typography
          component='p'
          variant='h6'
          sx={{
            color: theme.palette.TwClrTxt,
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '24px',
          }}
        >
          {strings.GET_STARTED_SUBTITLE}
        </Typography>
      </Box>
      {rows.map((row, index) => (
        <Grid key={index} container spacing={3} sx={{ marginBottom: '16px', padding: 0 }}>
          <Grid item xs={primaryGridSize}>
            <Box
              sx={{
                alignItems: 'center',
                background: theme.palette.TwClrBgSecondary,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'center',
                minHeight: '112px',
                padding: '8px',
              }}
            >
              <Icon
                name={row.icon}
                size='medium'
                style={{
                  fill: theme.palette.TwClrIcnSecondary,
                }}
              />
              <Typography
                sx={{
                  color: theme.palette.TwClrTxt,
                  fontSize: '16px',
                  fontWeight: 600,
                  lineHeight: '24px',
                }}
              >
                {row.title}
              </Typography>
            </Box>
          </Grid>

          {(isDesktop || row.onboardingCardItems[0]) && (
            <Grid item xs={primaryGridSize}>
              {row.onboardingCardItems[0] && <OnboardingCardItem {...row.onboardingCardItems[0]} />}
            </Grid>
          )}

          {(isDesktop || row.onboardingCardItems[1]) && (
            <Grid item xs={primaryGridSize}>
              {row.onboardingCardItems[1] && <OnboardingCardItem {...row.onboardingCardItems[1]} />}
            </Grid>
          )}

          <Grid item xs={primaryGridSize}>
            {row.buttonProps && (
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  height: '100%',
                  justifyContent: 'center',
                  paddingBottom: isDesktop ? 0 : '24px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <Button
                  priority='secondary'
                  style={{
                    marginLeft: isMobile ? 0 : undefined,
                    width: isMobile ? '100%' : 'auto',
                  }}
                  type='productive'
                  {...row.buttonProps}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

export default OnboardingCard;
