import React, { type JSX, useMemo } from 'react';

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';

import strings from 'src/strings';
import { SpeciesProjectElement } from 'src/types/Species';

type Nativity = NonNullable<SpeciesProjectElement['calculatedNativity']>;

type SpeciesNativityBadgeProps = {
  nativity?: Nativity;
};

const SpeciesNativityBadge = ({ nativity }: SpeciesNativityBadgeProps): JSX.Element | null => {
  const theme = useTheme();

  const badgeProps = useMemo((): BadgeProps | undefined => {
    switch (nativity) {
      case 'Native':
        return {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
          label: strings.NATIVE,
        };
      case 'Introduced':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
          label: strings.INTRODUCED,
        };
      case 'Invasive':
        return {
          backgroundColor: theme.palette.TwClrBgDangerTertiary,
          borderColor: theme.palette.TwClrBrdrDanger,
          labelColor: theme.palette.TwClrTxtDanger,
          label: strings.INVASIVE,
        };
      case 'Unknown':
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: strings.UNKNOWN,
        };
    }
  }, [nativity, theme]);

  if (!badgeProps) {
    return null;
  }

  return <Badge {...badgeProps} />;
};

export default SpeciesNativityBadge;
