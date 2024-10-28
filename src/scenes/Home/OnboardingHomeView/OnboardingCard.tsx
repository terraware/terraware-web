import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { IconName } from '@terraware/web-components';
import { Icon } from '@terraware/web-components';
import { Props as ButtonProps } from '@terraware/web-components/components/Button/Button';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

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

  return (
    <Box
      sx={{
        alignItems: 'center',
        background: theme.palette.TwClrBg,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '16px',
      }}
    >
      <Box sx={{ paddingRight: '48px' }}>
        <img alt={strings.TERRAWARE_MOBILE_APP_IMAGE_ALT} src={'/assets/onboarding.png'} />
      </Box>
      <Box>
        <Box>
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
            <Box
              key={index}
              sx={{
                marginTop: '16px',
                marginBottom: '16px',
                marginLeft: '0px',
                marginRight: '0px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                background: theme.palette.TwClrBgSecondary,
                borderRadius: '8px',
                paddingTop: '24px',
                paddingBottom: '24px',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
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
                    marginLeft: '16px',
                  }}
                >
                  {index}
                </Box>
                <Box
                  sx={{
                    background: theme.palette.TwClrBaseGray025,
                    borderRadius: '8px',
                    display: 'flex',
                    height: '88px',
                    width: '88px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px',
                    marginLeft: '24px',
                  }}
                >
                  <Icon size='large' name={row.icon} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                <Box
                  sx={{
                    marginLeft: '24px',
                  }}
                >
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
                </Box>
                <Box sx={{

                    marginLeft: '24px',
                    marginRight: '24px',
                  }}>
                  {row.buttonProps && (
                    <Box
                      sx={{
                        alignItems: 'center',
                        display: 'flex',
                        height: '100%',
                        justifyContent: 'right',
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
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default OnboardingCard;
