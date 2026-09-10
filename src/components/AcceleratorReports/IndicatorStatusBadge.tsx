import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';

import { reportIndicatorSeverity, reportIndicatorStatusLabel } from 'src/components/AcceleratorReports/utils';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';
import { ReportIndicatorStatus } from 'src/types/AcceleratorReport';

type IndicatorStatusBadgeProps = {
  status: ReportIndicatorStatus;
};

const IndicatorStatusBadge = (props: IndicatorStatusBadgeProps): JSX.Element => {
  const { status } = props;
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const badgeProps = useMemo((): Omit<BadgeProps, 'label'> | undefined => {
    if (!activeLocale) {
      return undefined;
    }

    switch (reportIndicatorSeverity(status)) {
      case 'success':
        return {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
        };
      case 'warning':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
        };
      case 'danger':
        return {
          backgroundColor: theme.palette.TwClrBgDangerTertiary,
          borderColor: theme.palette.TwClrBrdrDanger,
          labelColor: theme.palette.TwClrTxtDanger,
        };
      default:
        return undefined;
    }
  }, [activeLocale, status, theme]);

  return (
    <Box sx={{ textWrap: 'nowrap' }}>
      {badgeProps && <Badge {...badgeProps} label={reportIndicatorStatusLabel(status, strings)} />}
    </Box>
  );
};

export default IndicatorStatusBadge;
