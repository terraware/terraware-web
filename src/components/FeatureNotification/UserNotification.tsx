import { Box } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Notification } from 'src/types/Notifications';
import { weightSystemsNames } from 'src/units';
import { supportedLocales } from 'src/strings/locales';
import TextWithLink from 'src/components/common/TextWithLink';
import { useOrganization, useUser } from 'src/providers';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';

export default function UserNotification(userTimeZone?: string): Notification {
  const { user, userPreferences } = useUser();
  const { selectedOrganization } = useOrganization();

  return {
    id: -1,
    notificationCriticality: 'Info',
    organizationId: selectedOrganization.id,
    title: strings.REVIEW_YOUR_ACCOUNT_SETTING,
    body: (
      <Box>
        <ul>
          <li>
            {strings.formatString(
              strings.DEFAULT_LANGUAGE_SELECTED,
              supportedLocales.find((sLocale) => sLocale.id === user?.locale)?.name || ''
            )}
          </li>
          <li>{strings.formatString(strings.TIME_ZONE_SELECTED, userTimeZone || '')}</li>
          <li>
            {strings.formatString(
              strings.WEIGHT_SYSTEM_SELECTED,
              weightSystemsNames().find((ws) => ws.value === userPreferences.preferredWeightSystem)?.label || ''
            )}
          </li>
        </ul>
        <Box paddingTop={1}>
          <TextWithLink text={strings.USER_NOTIFICATION_ACTION} href={APP_PATHS.MY_ACCOUNT} />
        </Box>
      </Box>
    ),
    localUrl: APP_PATHS.MY_ACCOUNT,
    createdTime: getTodaysDateFormatted(),
    isRead: false,
    hideDate: true,
  };
}
