import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { Box, Grid, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import PhaseScores from './PhaseScores';
import { useScoringData } from './ScoringContext';

const ScorecardView = () => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const history = useHistory();
  const { crumbs, phase0Scorecard, phase1Scorecard, projectId, projectName, status } = useScoringData();

  const goToScoresEdit = useCallback(() => {
    history.push({ pathname: APP_PATHS.ACCELERATOR_SCORING_EDIT.replace(':projectId', `${projectId}`) });
  }, [history, projectId]);

  const goToVoting = useCallback(() => {
    history.push({ pathname: APP_PATHS.ACCELERATOR_VOTING.replace(':projectId', `${projectId}`) });
  }, [history, projectId]);

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

            {activeLocale && (
              <Grid container spacing={theme.spacing(2)}>
                <Grid item xs={6}>
                  <PhaseScores phaseScores={phase0Scorecard} />
                </Grid>
                <Grid item xs={6}>
                  <PhaseScores phaseScores={phase1Scorecard} />
                </Grid>
              </Grid>
            )}
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
