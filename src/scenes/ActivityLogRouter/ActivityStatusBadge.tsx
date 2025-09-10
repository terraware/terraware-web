import React, { useMemo } from 'react';

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';

import { MockActivityStatus } from 'src/types/Activity';

type ActivityStatusBadgeProps = {
  status: MockActivityStatus;
};

const ActivityStatusBadge = (props: ActivityStatusBadgeProps): JSX.Element => {
  const { status } = props;
  const theme = useTheme();

  const badgeColors = useMemo((): Omit<BadgeProps, 'label'> | undefined => {
    switch (status) {
      case 'Changed':
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

  return <Badge label={status} {...badgeColors} />;
};

export default ActivityStatusBadge;
