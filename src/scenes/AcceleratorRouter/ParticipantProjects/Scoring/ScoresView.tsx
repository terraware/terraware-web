import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Grid, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import useListModules from 'src/hooks/useListModules';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import PhaseScores from './PhaseScores';
import { useScoringData } from './ScoringContext';

const ScorecardView = () => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const navigate = useNavigate();
  const { crumbs, hasData, phase0Scores, phase1Scores, project, status } = useScoringData();

  const { modules, listModules } = useListModules();

  useEffect(() => {
    if (project) {
      void listModules({ projectId: project.id });
    }
  }, [project, listModules]);

  const goToScoresEdit = useCallback(() => {
    if (project) {
      navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECT_SCORES_EDIT.replace(':projectId', `${project.id}`) });
    }
  }, [navigate, project]);

  const goToVoting = useCallback(() => {
    if (project) {
      navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECT_VOTES.replace(':projectId', `${project.id}`) });
    }
  }, [navigate, project]);

  const rightComponent = useMemo(
    () =>
      activeLocale && (
        <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
          <Button
            id='editScores'
            icon='iconEdit'
            label={strings.EDIT_SCORES}
            priority='primary'
            onClick={goToScoresEdit}
            size='medium'
            type='productive'
          />
        </Box>
      ),
    [activeLocale, goToScoresEdit, theme]
  );

  useEffect(() => {
    if (hasData === false) {
      goToScoresEdit();
    }
  }, [goToScoresEdit, hasData]);

  return (
    <PageWithModuleTimeline
      title={`${project?.name ?? ''} ${strings.SCORES}`}
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      rightComponent={rightComponent}
      cohortPhase={project?.cohortPhase}
      modules={modules ?? []}
    >
      {status === 'pending' && <BusySpinner />}
      {hasData && (
        <Card style={{ width: '100%' }}>
          <Box display='flex' flexDirection='row' flexGrow={0} margin={theme.spacing(3)} justifyContent='right'>
            <Button
              id='goToVotes'
              label={strings.SEE_IC_VOTES}
              priority='secondary'
              onClick={goToVoting}
              size='medium'
              type='productive'
            />
          </Box>

          {activeLocale && (
            <Grid container spacing={theme.spacing(2)}>
              <Grid item xs={6}>
                <PhaseScores phaseScores={phase0Scores} />
              </Grid>
              <Grid item xs={6}>
                <PhaseScores phaseScores={phase1Scores} />
              </Grid>
            </Grid>
          )}
        </Card>
      )}
    </PageWithModuleTimeline>
  );
};

export default ScorecardView;
