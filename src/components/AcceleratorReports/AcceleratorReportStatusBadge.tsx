import React, { type JSX, useMemo } from 'react';

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';
import { AcceleratorReportStatus } from 'src/types/AcceleratorReport';

type AcceleratorReportStatusBadgeProps = {
  status: AcceleratorReportStatus;
};

const AcceleratorReportStatusBadge = (props: AcceleratorReportStatusBadgeProps): JSX.Element => {
  const { status } = props;
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const badgeProps = useMemo((): BadgeProps | undefined => {
    if (!activeLocale) {
      return undefined;
    }

    switch (status) {
      case 'Approved':
        return {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
          label: strings.APPROVED,
        };
      case 'Not Needed':
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: strings.NOT_NEEDED,
        };
      case 'Needs Update':
        return {
          backgroundColor: theme.palette.TwClrBgDangerTertiary,
          borderColor: theme.palette.TwClrBrdrDanger,
          labelColor: theme.palette.TwClrTxtDanger,
          label: isAcceleratorRoute ? strings.UPDATE_REQUESTED : strings.UPDATE_NEEDED,
        };
      case 'Not Submitted':
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: strings.NOT_SUBMITTED,
        };
      case 'Submitted':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
          label: strings.SUBMITTED,
        };
      default:
        return undefined;
    }
  }, [activeLocale, isAcceleratorRoute, status, theme]);

  return <>{badgeProps && <Badge {...badgeProps} />}</>;
};

export default AcceleratorReportStatusBadge;
