import React, { type JSX, useMemo } from 'react';

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';

import { PlantingDateRequestStatus } from 'src/queries/search/plantingDateRequests';
import strings from 'src/strings';

type PlantingDateRequestStatusBadgeProps = {
  status?: PlantingDateRequestStatus;
};

const PlantingDateRequestStatusBadge = ({ status }: PlantingDateRequestStatusBadgeProps): JSX.Element => {
  const theme = useTheme();

  const badgeProps = useMemo((): BadgeProps => {
    const warningColors = {
      backgroundColor: theme.palette.TwClrBgWarningTertiary,
      borderColor: theme.palette.TwClrBrdrWarning,
      labelColor: theme.palette.TwClrTxtWarning,
    };

    switch (status) {
      case 'Fulfilled':
        return {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
          label: strings.FULFILLED,
        };
      case 'Pending':
      case 'Partial':
        return { ...warningColors, label: strings.REQUESTED };
      default:
        return { ...warningColors, label: strings.NOT_YET_REQUESTED };
    }
  }, [status, theme]);

  return <Badge {...badgeProps} />;
};

export default PlantingDateRequestStatusBadge;
