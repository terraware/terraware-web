import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import strings from 'src/strings';
import { ChallengeMitigation } from 'src/types/AcceleratorReport';

import EditableReportBox from './EditableReportBox';

const ChallengeMitigationPlan = ({
  challenge,
  key,
  includeBorder,
}: {
  challenge: ChallengeMitigation;
  key: string;
  includeBorder: boolean;
}) => {
  const theme = useTheme();

  return (
    <Box marginBottom={1}>
      <Box
        key={key}
        sx={{ scrollMarginTop: '50vh' }}
        borderBottom={`1px solid ${theme.palette.TwClrBrdrSecondary}`}
        width={'100%'}
      >
        <Grid container marginBottom={1}>
          <Grid item xs={6}>
            <Typography fontWeight={600}>{strings.CHALLENGE}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography fontWeight={600}>{strings.MITIGATION_PLAN}</Typography>
          </Grid>
        </Grid>
      </Box>

      <Grid
        container
        borderBottom={includeBorder ? `1px solid ${theme.palette.TwClrBgTertiary}` : ''}
        marginBottom={1}
        xs={12}
        width={'100%'}
      >
        <Grid item xs={6}>
          <Box paddingRight={theme.spacing(2)}>
            <Textfield
              key={key}
              type='text'
              value={challenge.challenge}
              id={`challenge-${key}`}
              label={''}
              display={true}
              preserveNewlines
            />
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box paddingRight={theme.spacing(2)}>
            <Textfield
              key={key}
              type='text'
              value={challenge.mitigationPlan}
              id={`mitigation-${key}`}
              label={''}
              display={true}
              preserveNewlines
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

const ChallengesMitigationBox = ({ challenges }: { challenges?: ChallengeMitigation[] }) => {
  return (
    <EditableReportBox
      name={''}
      includeBorder={false}
      canEdit={false}
      onEdit={() => {}}
      onCancel={() => {}}
      onSave={() => {}}
    >
      {challenges?.map((challenge, i) => (
        <ChallengeMitigationPlan challenge={challenge} key={i.toString()} includeBorder={i < challenges.length - 1} />
      ))}
    </EditableReportBox>
  );
};

export default ChallengesMitigationBox;
