import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Grid, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import useListModules from 'src/hooks/useListModules';
import useNavigateTo from 'src/hooks/useNavigateTo';
import strings from 'src/strings';
import { Score, ScoreCategory, ScoreValue } from 'src/types/Score';

import PhaseScores from './PhaseScores';
import { useScoringData } from './ScoringContext';
import useScoresUpdate from './useScoresUpdate';

const ScorecardEditView = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { crumbs, hasData, phase0Scores, phase1Scores, project, status } = useScoringData();
  const { update, status: updateStatus } = useScoresUpdate(project?.id);
  const { goToParticipantProject } = useNavigateTo();

  const [scores, setScores] = useState<Score[]>([]);
  const [updatedScores, setUpdatedScores] = useState<Score[]>([]);

  const { modules, listModules } = useListModules();

  useEffect(() => {
    if (project) {
      void listModules({ projectId: project.id });
    }
  }, [project, listModules]);

  const goToVoting = useCallback(() => {
    if (project) {
      navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECT_VOTES.replace(':projectId', `${project.id}`) });
    }
  }, [navigate, project]);

  const goToScorecardView = useCallback(() => {
    if (project) {
      navigate({ pathname: APP_PATHS.ACCELERATOR_PROJECT_SCORES.replace(':projectId', `${project.id}`) });
    }
  }, [navigate, project]);

  const onCancel = useCallback(() => {
    if (project) {
      if (hasData === false) {
        goToParticipantProject(project.id);
      } else {
        goToScorecardView();
      }
    }
  }, [hasData, goToParticipantProject, goToScorecardView, project]);

  const handleOnChange = (key: 'value' | 'qualitative', category: ScoreCategory, value: ScoreValue | string) => {
    const originalScore = scores.find((score: Score) => score.category === category);
    if (originalScore) {
      setUpdatedScores((prev) => [
        ...prev.filter((score: Score) => score.category !== category),
        {
          ...(prev.find((score: Score) => score.category === category) || originalScore),
          [key]: value,
        },
      ]);
    }
  };

  const handleOnChangeValue = (category: ScoreCategory, value: ScoreValue) => handleOnChange('value', category, value);

  const handleOnChangeQualitative = (category: ScoreCategory, value: string) =>
    handleOnChange('qualitative', category, value);

  const onSave = useCallback(() => {
    if (updatedScores.length === 0) {
      goToScorecardView();
      return;
    }
    if (project?.cohortPhase) {
      const phaseToSend =
        project.cohortPhase === 'Application' || project.cohortPhase === 'Pre-Screen'
          ? 'Phase 0 - Due Diligence'
          : project.cohortPhase;
      update(phaseToSend, updatedScores);
    }
  }, [goToScorecardView, update, updatedScores, project]);

  useEffect(() => {
    const localPhase1Scores = [...(phase1Scores?.scores || [])];
    setScores(localPhase1Scores);
  }, [phase1Scores]);

  useEffect(() => {
    if (updateStatus === 'success') {
      goToScorecardView();
    }
  }, [updateStatus, goToScorecardView]);

  return (
    <PageWithModuleTimeline
      title={`${project?.name ?? ''} ${strings.SCORES}`}
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      modules={modules ?? []}
      cohortPhase={project?.cohortPhase}
    >
      <PageForm
        busy={status === 'pending'}
        cancelID='cancelEditScorecard'
        onCancel={onCancel}
        onSave={onSave}
        saveID='saveEditScorecard'
        style={{ width: '100%' }}
      >
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

          <Grid container spacing={theme.spacing(2)}>
            <Grid item xs={6}>
              <PhaseScores
                phaseScores={phase0Scores}
                onChangeValue={handleOnChangeValue}
                onChangeQualitative={handleOnChangeQualitative}
                editable={
                  project?.cohortPhase &&
                  ['Pre-Screen', 'Application', 'Phase 0 - Due Diligence'].includes(project.cohortPhase)
                }
              />
            </Grid>
            <Grid item xs={6}>
              <PhaseScores
                phaseScores={phase1Scores}
                onChangeValue={handleOnChangeValue}
                onChangeQualitative={handleOnChangeQualitative}
                editable={project?.cohortPhase === 'Phase 1 - Feasibility Study'}
              />
            </Grid>
          </Grid>
        </Card>
      </PageForm>
    </PageWithModuleTimeline>
  );
};

export default ScorecardEditView;
