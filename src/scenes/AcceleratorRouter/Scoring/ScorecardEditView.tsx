import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Box, Grid, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { requestUpdateScores } from 'src/redux/features/scores/scoresAsyncThunks';
import { selectScoresUpdateRequest } from 'src/redux/features/scores/scoresSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Score, Scorecard as ScorecardType } from 'src/types/Score';
import useSnackbar from 'src/utils/useSnackbar';

import ScoreEntry from './ScoreEntry';
import Scorecard from './Scorecard';
import useScoreList from './useScoreList';

const ScorecardEditView = () => {
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { projectName, scorecards, status } = useScoreList(projectId);
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const history = useHistory();

  const [scores, setScores] = useState<Score[]>([]);
  const [requestId, setRequestId] = useState('');
  const scoresUpdateResult = useAppSelector(selectScoresUpdateRequest(requestId));

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              name: strings.PROJECTS,
              to: APP_PATHS.ACCELERATOR_PROJECT_LIST, // TODO switch to project management page holding the project id
            },
            {
              name: projectName || '',
              to: APP_PATHS.ACCELERATOR_PROJECT.replace(':projectId', `${projectId}`),
            },
          ]
        : [],
    [activeLocale, projectId, projectName]
  );

  const phase0Scorecard = useMemo(
    () => scorecards?.find((scorecard: ScorecardType) => scorecard.phase === 'Phase 0'),
    [scorecards]
  );

  const phase1Scorecard = useMemo(
    () => scorecards?.find((scorecard: ScorecardType) => scorecard.phase === 'Phase 1'),
    [scorecards]
  );

  const numberOfScores = useMemo(() => {
    const phase0ScoresLength = phase0Scorecard?.scores?.length || 0;
    const phase1ScoresLength = phase1Scorecard?.scores?.length || 0;
    return Math.max(phase0ScoresLength, phase1ScoresLength);
  }, [phase0Scorecard?.scores?.length, phase1Scorecard?.scores?.length]);

  const goToVoting = useCallback(() => {
    history.push({ pathname: APP_PATHS.ACCELERATOR_VOTING.replace(':projectId', `${projectId}`) });
  }, [history, projectId]);

  const goToScorecardView = useCallback(() => {
    history.push({ pathname: APP_PATHS.ACCELERATOR_SCORING.replace(':projectId', `${projectId}`) });
  }, [history, projectId]);

  const onCancel = useCallback(() => {
    goToScorecardView();
  }, [goToScorecardView]);

  const getOnChange = (index: number) => (score: Score) => {
    const newScores = [...scores];
    newScores[index] = { ...score };
    setScores(newScores);
  };

  const getOnChangeText = (index: number) => (id: string, value: unknown) => {
    // TODO: handle text changes
    // Remove this code as the qualitative info may be included in the Score object
    // and the state and onChange handling code for qualitative info will be removed
  };

  const onSave = useCallback(() => {
    const request = dispatch(requestUpdateScores({ projectId, scores }));
    setRequestId(request.requestId);
  }, [dispatch, projectId, scores]);

  useEffect(() => {
    setScores([...(phase1Scorecard?.scores || [])]);
  }, [phase1Scorecard]);

  useEffect(() => {
    if (scoresUpdateResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (scoresUpdateResult?.status === 'success' && scoresUpdateResult?.data) {
      goToScorecardView();
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    }
  }, [scoresUpdateResult?.status, scoresUpdateResult?.data, goToScorecardView, snackbar]);

  return (
    <Page title={`Edit Scoring for project ${projectName}`} crumbs={crumbs} hierarchicalCrumbs={false}>
      {status === 'pending' && <BusySpinner />}
      <PageForm
        busy={false}
        cancelID='cancelEditScorecard'
        onCancel={onCancel}
        onSave={onSave}
        saveID='saveEditScorecard'
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
              <Scorecard scorecard={phase0Scorecard} />
            </Grid>
            <Grid item xs={6}>
              <Scorecard scorecard={phase1Scorecard} />
            </Grid>
          </Grid>

          {(phase0Scorecard || phase1Scorecard) &&
            numberOfScores &&
            Array.from({ length: numberOfScores }).map((_, index) => (
              <Grid key={index} container spacing={theme.spacing(2)}>
                <Grid item xs={6}>
                  {phase0Scorecard?.scores?.[index] && (
                    <ScoreEntry
                      disabled={true}
                      key={index}
                      onChange={(_score: Score) => {}}
                      onChangeText={(_id: string, _value: unknown) => {}}
                      phase={phase0Scorecard?.phase}
                      qualitativeInfo={''}
                      score={phase0Scorecard.scores[index]}
                    />
                  )}
                </Grid>
                <Grid item xs={6}>
                  {(scores?.[index] || phase1Scorecard?.scores?.[index]) && (
                    <ScoreEntry
                      key={index}
                      onChange={getOnChange(index)}
                      onChangeText={getOnChangeText(index)}
                      phase={phase1Scorecard?.phase || ''}
                      qualitativeInfo={''}
                      score={scores?.[index] || phase1Scorecard?.scores?.[index]}
                    />
                  )}
                </Grid>
              </Grid>
            ))}
        </Card>
      </PageForm>
    </Page>
  );
};

export default ScorecardEditView;
