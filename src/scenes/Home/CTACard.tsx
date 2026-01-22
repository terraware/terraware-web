import React, { type JSX } from 'react';

import { Box, SxProps, Typography, useTheme } from '@mui/material';
import { Props as ButtonProps } from '@terraware/web-components/components/Button/Button';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Button from 'src/components/common/button/Button';

type CTACardProps = {
  buttonsContainerSx?: SxProps;
  description: string | (string | JSX.Element)[];
  imageAlt?: string;
  imageSource?: string;
  padding?: number | string;
  primaryButtonProps?: ButtonProps;
  secondaryButtonProps?: ButtonProps;
  title?: string | (string | JSX.Element)[];
};

const CTACard = ({
  buttonsContainerSx,
  description,
  imageAlt,
  imageSource,
  padding = '24px',
  primaryButtonProps,
  secondaryButtonProps,
  title,
}: CTACardProps): JSX.Element => {
  const { isDesktop, isMobile, isTablet } = useDeviceInfo();
  const theme = useTheme();

  return (
    <Box
      sx={{
        alignItems: 'center',
        background: theme.palette.TwClrBg,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        height: '100%',
        justifyContent: 'space-between',
        padding,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        {imageSource && (
          <Box
            sx={{
              marginBottom: isMobile ? '32px' : 0,
              marginRight: isMobile ? 0 : '32px',
              textAlign: 'center',
            }}
          >
            <img alt={imageAlt} src={imageSource} />
          </Box>
        )}
        <Box>
          {title && (
            <Typography
              component='div'
              variant='h6'
              sx={{
                color: theme.palette.TwClrTxt,
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '24px',
              }}
            >
              {title}
            </Typography>
          )}
          <Typography
            component='div'
            variant='h6'
            sx={{
              color: theme.palette.TwClrTxt,
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '24px',
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={[
          {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            marginLeft: isDesktop ? '27px' : 0,
            marginTop: isMobile || isTablet ? '24px' : 0,
            whiteSpace: 'nowrap',
          },
          ...(Array.isArray(buttonsContainerSx) ? buttonsContainerSx : [buttonsContainerSx]),
        ]}
      >
        {primaryButtonProps && <Button priority='secondary' type='productive' {...primaryButtonProps} />}
        {secondaryButtonProps && (
          <Button
            priority='secondary'
            style={{
              marginLeft: isMobile ? 0 : '19px',
              marginTop: isMobile ? '19px' : '5px',
            }}
            type='passive'
            {...secondaryButtonProps}
          />
        )}
      </Box>
    </Box>
  );
};

export default CTACard;
