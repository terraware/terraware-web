import React, { type JSX, useMemo } from 'react';

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';

import { useLocalization } from 'src/providers';
import { ActivityStatusTag, activityStatusTagLabel } from 'src/types/Activity';

type ActivityStatusBadgeProps = {
  status: ActivityStatusTag;
};

const ActivityStatusBadge = (props: ActivityStatusBadgeProps): JSX.Element => {
  const { status } = props;
  const theme = useTheme();
  const { strings } = useLocalization();

  const badgeColors = useMemo((): Omit<BadgeProps, 'label'> | undefined => {
    switch (status) {
      case 'Unpublished Changes':
      case 'Project Updated':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
        };
      case 'Do Not Use':
      case 'Published':
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
        };
      case 'Not Verified':
        return {
          backgroundColor: theme.palette.TwClrBgDangerTertiary,
          borderColor: theme.palette.TwClrBrdrDanger,
          labelColor: theme.palette.TwClrTxtDanger,
        };
      case 'Verified':
        return {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
        };
      default:
        return undefined;
    }
  }, [status, theme]);

  return <Badge label={activityStatusTagLabel(status, strings)} {...badgeColors} />;
};

export default ActivityStatusBadge;
