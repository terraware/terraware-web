import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Grid, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Scorecard as ScorecardType } from 'src/types/Score';

import Scorecard from './Scorecard';
import useScoreList from './useScoreList';

const ScorecardView = () => {
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const { projectName, scorecards, status } = useScoreList(projectId);
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  // This goes away when the view is implemented
  // tslint:disable:no-console
  console.log(scorecards);

  const goToScoresEdit = useCallback(() => {
    console.log('go to edit');
  }, []);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? `${strings.PROJECTS} / ${projectName}` : '',
        to: APP_PATHS.ACCELERATOR_PROJECT.replace(':projectId', `${projectId}`),
      },
    ],
    [activeLocale, projectId, projectName]
  );

  const rightComponent = useMemo(
    () => (
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
    [goToScoresEdit, theme]
  );

  return (
    <Grid container spacing={theme.spacing(1)}>
      <Grid item xs={10}>
        <Page title={`${projectName} ${strings.SCORES}`} crumbs={crumbs} rightComponent={rightComponent}>
          {status === 'pending' && <BusySpinner />}
          <Card style={{ width: '100%' }}>
            <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
              <Button
                id='goToVotes'
                label={strings.SEE_IC_VOTES}
                priority='secondary'
                onClick={goToScoresEdit}
                size='medium'
                type='productive'
              />
            </Box>
            <Grid container spacing={theme.spacing(2)}>
              <Grid item xs={6}>
                <Scorecard
                  scorecard={(scorecards || []).find((scorecard: ScorecardType) => scorecard.phase === 'Phase 0')}
                />
              </Grid>
              <Grid item xs={6}>
                <Scorecard
                  scorecard={(scorecards || []).find((scorecard: ScorecardType) => scorecard.phase === 'Phase 1')}
                />
              </Grid>
            </Grid>
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
