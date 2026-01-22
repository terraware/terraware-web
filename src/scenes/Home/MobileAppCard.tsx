import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Box, SxProps, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';
import Button from 'src/components/common/button/Button';
import { TERRAWARE_MOBILE_APP_ANDROID_GOOGLE_PLAY_LINK, TERRAWARE_MOBILE_APP_IOS_APP_STORE_LINK } from 'src/constants';
import { useUser } from 'src/providers';
import strings from 'src/strings';

type MobileAppCardProps = {
  buttonsContainerSx?: SxProps;
  description: string | (string | JSX.Element)[];
  imageAlt?: string;
  imageSource?: string;
  padding?: number | string;
  title?: string | (string | JSX.Element)[];
  allowDismiss?: boolean;
  dismissPreferenceId?: string;
};

const MobileAppCard = ({
  description,
  imageAlt,
  imageSource,
  padding = '24px',
  title,
  allowDismiss,
  dismissPreferenceId,
}: MobileAppCardProps): JSX.Element => {
  const { isDesktop, isMobile } = useDeviceInfo();
  const theme = useTheme();
  const { updateUserPreferences, userPreferences, reloadUserPreferences } = useUser();
  const [showCard, setShowCard] = useState(true);

  useEffect(() => {
    if (!allowDismiss) {
      setShowCard(true);
    }
    if (allowDismiss && dismissPreferenceId && !userPreferences[dismissPreferenceId]) {
      setShowCard(true);
    }
    if (allowDismiss && dismissPreferenceId && userPreferences[dismissPreferenceId]) {
      setShowCard(false);
    }
  }, [allowDismiss, dismissPreferenceId, userPreferences]);

  const dismissMobileAppCard = useCallback(async () => {
    if (dismissPreferenceId) {
      await updateUserPreferences({ [dismissPreferenceId]: true });
      reloadUserPreferences();
    }
  }, [dismissPreferenceId, reloadUserPreferences, updateUserPreferences]);

  const handleDismissClick = useCallback(() => {
    void dismissMobileAppCard();
  }, [dismissMobileAppCard]);

  if (!showCard) {
    return <Box />;
  }

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
              component='p'
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
            component='p'
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

      {isDesktop ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            marginLeft: '27px',
            marginTop: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: isDesktop ? '24px' : 0,
            }}
          >
            <Link
              onClick={() => {
                window.open(TERRAWARE_MOBILE_APP_ANDROID_GOOGLE_PLAY_LINK, '_blank');
              }}
            >
              <img alt={imageAlt} src={'/assets/Android-QR.svg'} />
              <Typography
                component='p'
                variant='h6'
                sx={{
                  color: theme.palette.TwClrTxtSecondary,
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '20px',
                }}
              >
                {strings.DOWNLOAD_FOR_ANDROID}
              </Typography>
            </Link>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Link
              onClick={() => {
                window.open(TERRAWARE_MOBILE_APP_IOS_APP_STORE_LINK, '_blank');
              }}
            >
              <img alt={imageAlt} src={'/assets/iOS-QR.svg'} />
              <Typography
                component='p'
                variant='h6'
                sx={{
                  color: theme.palette.TwClrTxtSecondary,
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '20px',
                }}
              >
                {strings.DOWNLOAD_FOR_IOS}
              </Typography>
            </Link>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            marginLeft: 0,
            marginTop: '24px',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          <Button
            priority='secondary'
            style={{
              width: isMobile ? '100%' : 'auto',
            }}
            label={strings.DOWNLOAD_FOR_ANDROID}
            type='passive'
            onClick={() => {
              window.open(TERRAWARE_MOBILE_APP_ANDROID_GOOGLE_PLAY_LINK, '_blank');
            }}
          />
          <Button
            priority='secondary'
            style={{
              marginTop: isMobile ? '19px' : '5px',
              width: isMobile ? '100%' : 'auto',
            }}
            type='passive'
            label={strings.DOWNLOAD_FOR_IOS}
            onClick={() => {
              window.open(TERRAWARE_MOBILE_APP_IOS_APP_STORE_LINK, '_blank');
            }}
          />
        </Box>
      )}
      {allowDismiss && (
        <Box>
          <Link fontSize='16px' fontWeight={400} onClick={handleDismissClick}>
            {strings.DISMISS}
          </Link>
        </Box>
      )}
    </Box>
  );
};

export default MobileAppCard;
