import { useMemo } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { VoteOption } from 'src/types/Votes';

// Vote info component
export type VoteInfoProps = {
  style?: Record<string, any>;
  title: string | string[];
  // TODO; add condition text
  voteOption?: VoteOption;
};

const VoteInfo = ({ style, title, voteOption }: VoteInfoProps): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const badgeProps = useMemo((): BadgeProps | undefined => {
    if (!activeLocale) {
      return undefined;
    }

    switch (voteOption) {
      case 'conditional':
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: strings.CONDITIONAL,
        };
      case 'no':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
          label: strings.NO,
        };
      case 'yes':
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
    voteOption,
  ]);

  return (
    <Grid alignItems='center' display='flex' flexDirection='row' flexGrow={1}>
      <Grid item xs={4}>
        <Typography color={theme.palette.TwClrBaseBlack} fontSize='16px' fontWeight={400} lineHeight='24px'>
          {title}
        </Typography>
      </Grid>
      <Grid item xs={8}>
        {badgeProps && <Badge {...badgeProps} />}
      </Grid>
    </Grid>
  );
};

export default VoteInfo;
