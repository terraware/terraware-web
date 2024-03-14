import { useMemo } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { Badge, Textfield } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { VoteOption } from 'src/types/Votes';

// Vote info component
export type VoteInfoProps = {
  conditionalInfo?: string;
  title: string | string[];
  // TODO; add condition text
  voteOption?: VoteOption;
};

const VoteInfo = ({ conditionalInfo, title, voteOption }: VoteInfoProps): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const badgeProps = useMemo((): BadgeProps | undefined => {
    if (!activeLocale) {
      return undefined;
    }

    switch (voteOption) {
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
    voteOption,
  ]);

  return (
    <>
      <Row
        leftChild={
          <Typography color={theme.palette.TwClrBaseBlack} fontSize='16px' fontWeight={400} lineHeight='24px'>
            {title}
          </Typography>
        }
        rightChild={badgeProps && <Badge {...badgeProps} />}
      />
      {/* This is mostly for the top row alignment where title and badge are aligned by center. */}
      {voteOption === 'Conditional' && !!conditionalInfo && (
        <Row
          rightChild={
            <Textfield
              display
              id='vote-conditional-info'
              label={''}
              preserveNewlines
              type='textarea'
              value={conditionalInfo}
            />
          }
          style={{ marginTop: theme.spacing(1) }}
        />
      )}
    </>
  );
};

type Props = {
  leftChild?: React.ReactNode;
  rightChild?: React.ReactNode;
  style?: Record<string, string | number>;
};

const Row = ({ leftChild, rightChild, style }: Props): JSX.Element => {
  return (
    <Grid alignItems='center' display='flex' flexDirection='row' flexGrow={1} sx={style}>
      <Grid item xs={4}>
        {leftChild}
      </Grid>
      <Grid item xs={8}>
        {rightChild}
      </Grid>
    </Grid>
  );
};

export default VoteInfo;
