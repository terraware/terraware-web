import React, { useCallback, useEffect, useState } from 'react';

import { Box, Snackbar as SnackbarUI, Typography, useTheme } from '@mui/material';

import TextWithLink from 'src/components/common/TextWithLink';
import Button from 'src/components/common/button/Button';
import { useDocLinks } from 'src/docLinks';
import { useLocalization, useUser } from 'src/providers';
import { requestUserCookieConsentUpdate } from 'src/redux/features/user/usersAsyncThunks';
import { useAppDispatch } from 'src/redux/store';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const ONE_YEAR_IN_MILLISECONDS = 365 * 24 * 60 * 60 * 1000;

export default function CookieConsentBanner() {
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const { user } = useUser();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const docLinks = useDocLinks();

  const [confirmed, setConfirmed] = useState(false);
  const [visible, setVisible] = useState(false);

  const updateUserCookieConsent = useCallback((consent: boolean) => {
    dispatch(requestUserCookieConsentUpdate({ cookiesConsented: consent }));
    setConfirmed(true);
    setVisible(false);
  }, []);

  useEffect(() => {
    const cookiesConsentedTimeIsGreaterThanOneYear = user?.cookiesConsentedTime
      ? Date.now() - new Date(user.cookiesConsentedTime).valueOf() > ONE_YEAR_IN_MILLISECONDS
      : false;

    if (user && (typeof user?.cookiesConsented !== 'boolean' || cookiesConsentedTimeIsGreaterThanOneYear)) {
      setVisible(true);
    }
  }, [user]);

  return (
    <>
      {activeLocale && !confirmed && visible && (
        <SnackbarUI
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          id='cookie-consent-banner-snackbar'
          open={visible}
        >
          <Box
            sx={{
              alignItems: 'center',
              backgroundColor: '#fff',
              borderColor: '#B2AB93',
              borderRadius: '8px',
              borderWidth: '1px',
              boxShadow: '0px 4px 8px 0px #3A444533',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              padding: theme.spacing(3),
              width: '100%',
            }}
          >
            <Box
              sx={{
                flexDirection: 'column',
                paddingBottom: isMobile ? theme.spacing(2) : 0,
                paddingRight: isMobile ? 0 : theme.spacing(3),
              }}
            >
              <Typography>{strings.COOKIES_DESCRIPTION}</Typography>
              <TextWithLink href={docLinks.cookie_policy} isExternal text={strings.COOKIES_LEARN_MORE} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', height: '40px', width: isMobile ? '100%' : 'auto' }}>
              <Button
                label={strings.DECLINE}
                onClick={() => {
                  updateUserCookieConsent(false);
                }}
                priority='secondary'
                sx={{ width: isMobile ? '50%' : 'auto' }}
                type='productive'
              />
              <Button
                label={strings.ACCEPT}
                onClick={() => {
                  updateUserCookieConsent(true);
                }}
                priority='primary'
                sx={{ width: isMobile ? '50%' : 'auto' }}
                type='productive'
              />
            </Box>
          </Box>
        </SnackbarUI>
      )}
    </>
  );
}
