import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';

import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';
import { MetricStatus } from 'src/types/AcceleratorReport';

type MetricStatusBadgeProps = {
  status: MetricStatus;
};

const MetricStatusBadge = (props: MetricStatusBadgeProps): JSX.Element => {
  const { status } = props;
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const badgeProps = useMemo((): BadgeProps | undefined => {
    if (!activeLocale) {
      return undefined;
    }

    switch (status) {
      case 'Achieved':
        return {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
          label: strings.ACHIEVED,
        };
      case 'Unlikely':
        return {
          backgroundColor: theme.palette.TwClrBgDangerTertiary,
          borderColor: theme.palette.TwClrBrdrDanger,
          labelColor: theme.palette.TwClrTxtDanger,
          label: strings.UNLIKELY,
        };
      case 'On-Track':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
          label: strings.ON_TRACK,
        };
      default:
        return undefined;
    }
  }, [activeLocale, status, theme]);

  return <Box sx={{ textWrap: 'nowrap' }}>{badgeProps && <Badge {...badgeProps} />}</Box>;
};

export default MetricStatusBadge;
