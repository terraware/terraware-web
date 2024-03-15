import { useCallback, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Box, Grid, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Score, Scorecard as ScorecardType } from 'src/types/Score';

import ScoreEntry from './ScoreEntry';
import Scorecard from './Scorecard';
import useScoreList from './useScoreList';

const ScorecardView = () => {
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const { projectName, scorecards, status } = useScoreList(projectId);
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const history = useHistory();

  const goToScoresEdit = useCallback(() => {
    history.push({ pathname: APP_PATHS.ACCELERATOR_SCORING_EDIT.replace(':projectId', `${projectId}`) });
  }, [history, projectId]);

  const goToVoting = useCallback(() => {
    history.push({ pathname: APP_PATHS.ACCELERATOR_VOTING.replace(':projectId', `${projectId}`) });
  }, [history, projectId]);

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

  return (
    <Grid container spacing={theme.spacing(1)}>
      <Grid item xs={10}>
        <Page
          title={`${projectName} ${strings.SCORES}`}
          crumbs={crumbs}
          hierarchicalCrumbs={false}
          rightComponent={rightComponent}
        >
          {status === 'pending' && <BusySpinner />}
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
                        key={index}
                        disabled={true}
                        onChange={(score: Score) => {}}
                        onChangeText={(id: string, value: unknown) => {}}
                        phase={phase0Scorecard?.phase}
                        qualitativeInfo={'Good project with good folks ready to do good work... almost perfect'}
                        score={phase0Scorecard.scores[index]}
                      />
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    {phase1Scorecard?.scores?.[index] && (
                      <ScoreEntry
                        key={index}
                        disabled={true}
                        onChange={(score: Score) => {}}
                        onChangeText={(id: string, value: unknown) => {}}
                        phase={phase1Scorecard?.phase}
                        qualitativeInfo={''}
                        score={phase1Scorecard.scores[index]}
                      />
                    )}
                  </Grid>
                </Grid>
              ))}
          </Card>
        </Page>
      </Grid>
      <Grid item xs={2}>
        Stubbed module timeline
      </Grid>
    </Grid>
  );
};

export default ScorecardView;
