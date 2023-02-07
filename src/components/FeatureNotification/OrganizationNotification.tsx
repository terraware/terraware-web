import { Box } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Notification } from 'src/types/Notifications';
import TextWithLink from 'src/components/common/TextWithLink';
import { useOrganization } from 'src/providers';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';

export default function OrganizationNotification(orgTimeZone?: string): Notification {
  const { selectedOrganization } = useOrganization();

  return {
    id: -2,
    notificationCriticality: 'Info',
    organizationId: selectedOrganization.id,
    title: strings.REVIEW_YOUR_ORGANIZATION_SETTING,
    body: (
      <div>
        <ul>
          <li>{strings.formatString(strings.TIME_ZONE_SELECTED, orgTimeZone || '')}</li>
        </ul>
        <Box paddingTop={1}>
          <TextWithLink text={strings.ORG_NOTIFICATION_ACTION} href={APP_PATHS.ORGANIZATION} />
        </Box>
      </div>
    ),
    localUrl: APP_PATHS.ORGANIZATION,
    createdTime: getTodaysDateFormatted(),
    isRead: false,
    hideDate: true,
  };
}
