import React, { type JSX, useMemo } from 'react';

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';

import { PlantingSeasonPayload } from 'src/queries/generated/plantingSeasons';
import strings from 'src/strings';

type PlantingSeasonStatusBadgeProps = {
  status: PlantingSeasonPayload['status'];
};

const PlantingSeasonStatusBadge = ({ status }: PlantingSeasonStatusBadgeProps): JSX.Element | null => {
  const theme = useTheme();

  const badgeProps = useMemo((): BadgeProps | undefined => {
    switch (status) {
      case 'Active':
        return {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
          label: strings.ACTIVE,
        };
      case 'Upcoming':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
          label: strings.UPCOMING,
        };
      case 'Past End Date':
        return {
          backgroundColor: theme.palette.TwClrBgDangerTertiary,
          borderColor: theme.palette.TwClrBrdrDanger,
          labelColor: theme.palette.TwClrTxtDanger,
          label: strings.PAST_END_DATE,
        };
      case 'Closed':
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: strings.CLOSED,
        };
    }
  }, [status, theme]);

  if (!badgeProps) {
    return null;
  }

  return <Badge {...badgeProps} />;
};

export default PlantingSeasonStatusBadge;
