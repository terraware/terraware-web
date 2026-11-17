import React, { type JSX, useMemo } from 'react';

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';

import { useLocalization } from 'src/providers';

type PlantingDateRequestFulfillmentBadgeProps = {
  status: string;
};

const PlantingDateRequestFulfillmentBadge = ({ status }: PlantingDateRequestFulfillmentBadgeProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();

  const badgeProps = useMemo((): BadgeProps => {
    switch (status) {
      case 'Pending':
        return {
          backgroundColor: '#eff2f2',
          borderColor: '#c9d1d1',
          labelColor: '#4a5758',
          label: strings.NEW,
        };
      case 'Partial':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
          label: strings.PARTIALLY_FULFILLED,
        };
      case 'Fulfilled':
        return {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
          label: strings.FULFILLED,
        };
      default:
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: status,
        };
    }
  }, [status, theme, strings]);

  return <Badge {...badgeProps} />;
};

export default PlantingDateRequestFulfillmentBadge;
