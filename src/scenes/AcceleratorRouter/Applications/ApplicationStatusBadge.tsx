import React, { useMemo } from 'react';

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';

import { ApplicationStatus, getApplicationStatusLabel } from 'src/types/Application';

type ApplicationStatusBadgeProps = {
  status: ApplicationStatus;
};

const ApplicationStatusBadge = (props: ApplicationStatusBadgeProps): JSX.Element => {
  const { status } = props;
  const theme = useTheme();

  const badgeColors = useMemo((): Omit<BadgeProps, 'label'> | undefined => {
    switch (status) {
      case 'Failed Pre-screen':
        return {
          backgroundColor: theme.palette.TwClrBgDangerTertiary,
          borderColor: theme.palette.TwClrBrdrDanger,
          labelColor: theme.palette.TwClrTxtDanger,
        };
      case 'Not Submitted':
      case 'Passed Pre-screen':
      case 'PL Review':
      case 'Pre-check':
      case 'Ready for Review':
      case 'Submitted':
      case 'In Review':
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
        };
      case 'Waitlist':
      case 'Issue Active':
      case 'Issue Pending':
      case 'Needs Follow-up':
      case 'Not Accepted':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
        };
      case 'Accepted':
      case 'Carbon Eligible':
      case 'Issue Resolved':
        return {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
        };
      default:
        return undefined;
    }
  }, [status, theme]);

  return <>{<Badge {...badgeColors} label={getApplicationStatusLabel(status)} />}</>;
};

export default ApplicationStatusBadge;
