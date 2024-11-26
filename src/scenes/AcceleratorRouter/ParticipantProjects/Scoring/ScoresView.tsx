import React, { useMemo } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { DateTime } from 'luxon';

import Card from 'src/components/common/Card';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useProjectScore from 'src/hooks/useProjectScore';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import { useParticipantProjectData } from '../ParticipantProjectContext';
import ScoringWrapper from './ScoringWrapper';

const ScorecardView = () => {
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const { project, projectId } = useParticipantProjectData();
  const { projectScore, getStatus } = useProjectScore(projectId);
  const { goToAcceleratorProjectScoreEdit, goToAcceleratorProjectVote } = useNavigateTo();

  const rightComponent = useMemo(
    () =>
      activeLocale &&
      project && (
        <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
          <Button
            id='editScores'
            icon='iconEdit'
            label={strings.EDIT_SCORES}
            priority='primary'
            onClick={() => goToAcceleratorProjectScoreEdit(project.id)}
            size='medium'
            type='productive'
          />
        </Box>
      ),
    [activeLocale, project, goToAcceleratorProjectScoreEdit, theme]
  );

  const lastUpdatedDate = useMemo(() => {
    if (!activeLocale || !projectScore || !projectScore.modifiedTime) {
      return '--';
    }

    return DateTime.fromISO(projectScore.modifiedTime).toFormat('yyyy/MM/dd');
  }, [activeLocale, projectScore]);

  return (
    <ScoringWrapper isLoading={getStatus === 'pending'} rightComponent={rightComponent}>
      <Card style={{ width: '100%' }}>
        <Box display='flex' flexDirection='row' flexGrow={0} margin={theme.spacing(3)} justifyContent='right'>
          <Button
            id='goToVotes'
            label={strings.SEE_IC_VOTES}
            priority='secondary'
            onClick={() => goToAcceleratorProjectVote(projectId)}
            size='medium'
            type='productive'
          />
        </Box>
        {projectScore && (
          <Box
            justifyItems={'center'}
            width={'100%'}
            sx={{
              background: theme.palette.TwClrBaseGray050,
              borderRadius: theme.spacing(1),
              gap: theme.spacing(8),
              padding: theme.spacing(2),
            }}
          >
            <Typography fontWeight={600} fontSize={'20px'} lineHeight={'28px'}>
              {`${strings.OVERALL_SCORE}: ${projectScore.overallScore ?? '--'}`}
            </Typography>
            <Typography fontWeight={400} fontSize={'14px'} lineHeight={'20px'} marginTop={'2px'}>
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
                alignItems={isMobile ? 'flex-start' : 'center'}
                display='flex'
                flexDirection={isMobile ? 'column' : 'row'}
                flexGrow={1}
                rowGap={theme.spacing(2)}
              >
                <Grid item xs={2}>
                  <Typography fontWeight={500} fontSize={'14px'} lineHeight={'20px'}>
                    {strings.SCORE_SUMMARY}
                  </Typography>
                </Grid>
                <Grid item xs={10} marginTop={isMobile ? theme.spacing(1) : 0}>
                  <Typography fontWeight={400} fontSize={'14px'} lineHeight={'20px'}>
                    {projectScore?.summary ?? strings.NO_COMMENTS_ADDED}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography fontWeight={500} fontSize={'14px'} lineHeight={'20px'}>
                    {strings.SCORE_DETAILS_LINK}
                  </Typography>
                </Grid>
                <Grid item xs={10} marginTop={isMobile ? theme.spacing(1) : 0}>
                  <Typography fontWeight={400} fontSize={'14px'} lineHeight={'20px'}>
                    {projectScore?.detailsUrl ?? strings.NO_LINK_ADDED}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Card>
    </ScoringWrapper>
  );
};

export default ScorecardView;
