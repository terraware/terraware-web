import React, { useMemo } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { IconName } from '@terraware/web-components';
import { Icon } from '@terraware/web-components';
import { Props as ButtonProps } from '@terraware/web-components/components/Button/Button';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

import OnboardingCardItem, { OnboardingCardItemProps } from './OnboardingCardItem';

export type OnboardingCardRow = {
  buttonProps?: ButtonProps;
  icon: IconName;
  title: string;
  subtitle: string;
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
      <Grid container spacing={3} sx={{ marginBottom: '16px', padding: 0 }}>
        <Grid item xs={primaryGridSize}>
          <Box
            sx={{
              marginBottom: isMobile ? '32px' : 0,
              marginRight: isMobile ? 0 : '32px',
            }}
          >
            <img alt={strings.TERRAWARE_MOBILE_APP_IMAGE_ALT} src={'/assets/onboarding.png'} />
          </Box>
        </Grid>
        <Grid item xs={12 - primaryGridSize}>
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
          {rows.map((row, index) => (
            <Grid key={index} container spacing={3} sx={{ marginBottom: '16px', paddingTop: '24px' }}>
              <Grid
                container
                item
                xs={12}
                spacing={3}
                sx={{
                  background: theme.palette.TwClrBgSecondary,
                  borderRadius: '8px',
                  height: '100%',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '8px',
                }}
              >
                <Grid item xs={1}>
                  <Box
                    sx={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: theme.palette.TwClrBgBrand,
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '20px',
                      fontWeight: '700',
                    }}
                  >
                    {index}
                  </Box>
                </Grid>
                <Grid item xs={2}>
                  <Box
                    sx={{
                      background: theme.palette.TwClrBaseGray025,
                      borderRadius: '8px',
                      display:'flex',
                      height: '88px',
                      width: '88px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '8px',
                    }}
                  >
                    <Icon size='large' name={row.icon} />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    component='p'
                    variant='h6'
                    sx={{
                      color: theme.palette.TwClrTxt,
                      fontSize: '16px',
                      fontWeight: 600,
                      lineHeight: '24px',
                    }}
                  >
                    {row.title}
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
                    {row.subtitle}
                  </Typography>
                </Grid>

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
                        priority='primary'
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
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default OnboardingCard;
