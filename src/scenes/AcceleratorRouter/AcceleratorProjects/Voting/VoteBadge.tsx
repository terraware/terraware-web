import React, { type JSX, useMemo } from 'react';

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { VoteOption } from 'src/types/Votes';

export type VoteBadgeProps = {
  vote?: VoteOption;
};

const VoteBadge = ({ vote }: VoteBadgeProps): JSX.Element | null => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const badgeProps = useMemo((): BadgeProps | undefined => {
    if (!activeLocale) {
      return undefined;
    }

    switch (vote) {
      case 'Conditional':
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: strings.CONDITIONAL,
        };
      case 'No':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
          label: strings.NO,
        };
      case 'Yes':
        return {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
          label: strings.YES,
        };
      default:
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: strings.NOT_COMPLETE,
        };
    }
  }, [
    activeLocale,
    theme.palette.TwClrBgInfoTertiary,
    theme.palette.TwClrBrdrInfo,
    theme.palette.TwClrTxtInfo,
    theme.palette.TwClrBgSuccessTertiary,
    theme.palette.TwClrBrdrSuccess,
    theme.palette.TwClrTxtSuccess,
    theme.palette.TwClrBgWarningTertiary,
    theme.palette.TwClrBrdrWarning,
    theme.palette.TwClrTxtWarning,
    vote,
  ]);

  if (!badgeProps) {
    return null;
  }

  return <Badge {...badgeProps} />;
};

export default VoteBadge;
