import React, { useMemo } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import Link from 'src/components/common/Link';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Score } from 'src/types/Score';

type ScoreCardProps = {
  score: Score;
  isEditing?: boolean;
  onChange?: (key: string, value: string) => void;
};

const ScoreCard = ({ score, isEditing, onChange }: ScoreCardProps) => {
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const lastUpdatedDate = useMemo(() => {
    if (!activeLocale || !score.modifiedTime) {
      return '--';
    }

    return DateTime.fromISO(score.modifiedTime).toFormat('yyyy/MM/dd');
  }, [activeLocale, score]);

  const error = useMemo(() => {
    if (score.overallScore === undefined) {
      return '';
    }

    const scoreString = score.overallScore.toString();
    if (scoreString.length === 0) {
      return '';
    }

    if (isNaN(parseFloat(scoreString))) {
      return strings.INVALID_VALUE;
    }

    return '';
  }, [score.overallScore]);

  const overallScore = useMemo(() => {
    if (isEditing) {
      return (
        <Textfield
          type='text'
          id='overallScore'
          onChange={(value) => onChange?.('overallScore', value as string)}
          value={score.overallScore}
          errorText={error}
          label={''}
          sx={{
            width: '120px',
          }}
        />
      );
    } else {
      return (
        <Typography fontWeight={600} fontSize={'20px'} lineHeight={'28px'}>
          {score.overallScore?.toFixed(2) ?? '--'}
        </Typography>
      );
    }
  }, [isEditing, error, score, onChange]);

  const summary = useMemo(() => {
    if (isEditing) {
      return (
        <Textfield
          type='textarea'
          id='summary'
          onChange={(value) => onChange?.('summary', value as string)}
          value={score.summary}
          label={''}
          preserveNewlines
        />
      );
    } else {
      return (
        <Typography fontWeight={400} fontSize={'14px'} lineHeight={'20px'} whiteSpace={'pre-wrap'}>
          {score.summary ?? (activeLocale ? strings.NO_COMMENTS_ADDED : '')}
        </Typography>
      );
    }
  }, [activeLocale, isEditing, score, onChange]);

  const detailsUrl = useMemo(() => {
    if (isEditing) {
      return (
        <Textfield
          type='text'
          id='detailsUrl'
          onChange={(value) => onChange?.('detailsUrl', value as string)}
          value={score.detailsUrl}
          label={''}
        />
      );
    } else if (score.detailsUrl) {
      return (
        <Link fontSize={'14px'} fontWeight={400} lineHeight={'20px'} to={score.detailsUrl} target='_blank'>
          {score.detailsUrl}
        </Link>
      );
    } else {
      return (
        <Typography fontWeight={400} fontSize={'14px'} lineHeight={'20px'}>
          {activeLocale ? strings.NO_LINK_ADDED : ''}
        </Typography>
      );
    }
  }, [activeLocale, isEditing, score, onChange]);

  return (
    <Box
      justifyItems={'center'}
      width={'100%'}
      sx={{
        background: theme.palette.TwClrBaseGray050,
        borderRadius: theme.spacing(1),
        gap: theme.spacing(8),
        padding: theme.spacing(2),
        margin: isEditing ? theme.spacing(3, 3, 0) : 0,
      }}
    >
      <Box display={'inline-flex'} flexDirection={'row'} alignItems={'center'}>
        <Typography fontWeight={600} fontSize={'20px'} lineHeight={'28px'} marginRight={theme.spacing(1)}>
          {`${strings.OVERALL_SCORE}:`}
        </Typography>
        {overallScore}
      </Box>
      <Typography
        fontWeight={400}
        fontSize={'14px'}
        lineHeight={'20px'}
        marginTop={isEditing ? theme.spacing(1) : '2px'}
      >
        {`${strings.LAST_UPDATED}: ${lastUpdatedDate}`}
      </Typography>
      <Box
        justifyItems={'start'}
        width={'100%'}
        marginTop={theme.spacing(2)}
        sx={{
          border: 1,
          borderColor: theme.palette.TwClrBaseGray100,
          borderRadius: theme.spacing(1),
          padding: theme.spacing(2),
        }}
      >
        <Grid
          container
          alignItems={isEditing ? 'center' : 'flex-start'}
          display={'flex'}
          flexDirection={isMobile ? 'column' : 'row'}
          flexGrow={1}
          rowGap={theme.spacing(2)}
        >
          <Grid item xs={2}>
            <Typography fontWeight={500} fontSize={'14px'} lineHeight={'20px'}>
              {strings.SCORE_SUMMARY}
            </Typography>
          </Grid>
          <Grid item xs={10}>
            {summary}
          </Grid>
          <Grid item xs={2}>
            <Typography fontWeight={500} fontSize={'14px'} lineHeight={'20px'}>
              {strings.SCORE_DETAILS_LINK}
            </Typography>
          </Grid>
          <Grid item xs={10}>
            <Typography fontWeight={400} fontSize={'14px'} lineHeight={'20px'}>
              {detailsUrl}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ScoreCard;
