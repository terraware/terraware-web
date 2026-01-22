import React, { type JSX, useMemo } from 'react';

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';

import { ApplicationStatus } from 'src/types/Application';

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
      case 'Passed Pre-screen':
      case 'Not Submitted':
      case 'Submitted':
      case 'Sourcing Team Review':
      case 'GIS Assessment':
      case 'Carbon Assessment':
      case 'Expert Review':
      case 'P0 Eligible':
      case 'In Review':
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
        };
      case 'Waitlist':
      case 'Issue Active':
      case 'Issue Reassessment':
      case 'Not Eligible':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
        };
      case 'Accepted':
        return {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
        };
      default:
        return undefined;
    }
  }, [status, theme]);

  return <>{<Badge {...badgeColors} label={status} />}</>;
};

export default ApplicationStatusBadge;
