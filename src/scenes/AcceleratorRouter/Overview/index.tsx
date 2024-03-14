import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Grid, useTheme } from '@mui/material';

import Page from 'src/components/Page';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Scorecard } from 'src/types/Score';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ScoreEntry from '../Scoring/ScoreEntry';

const mockQualitativeInfo =
  'The project has a strong focus on carbon sequestration and is well positioned to deliver on this.';
const mockScorecard: Scorecard = {
  modifiedTime: '2021-10-01T00:00:00Z',
  phase: 'Phase 0',
  scores: [
    {
      category: 'Carbon',
      inputType: 'dropdown',
      type: 'user',
      value: 1,
    },
    {
      category: 'Finance',
      inputType: 'dropdown',
      type: 'user',
      value: 0,
    },
    {
      category: 'Forestry',
      inputType: 'dropdown',
      type: 'user',
      value: -1,
    },
    {
      category: 'Legal',
      inputType: 'dropdown',
      type: 'user',
      value: -2,
    },
  ],
};
const mockScorecard2: Scorecard = {
  modifiedTime: '2021-10-01T00:00:00Z',
  phase: 'Phase 1',
  scores: [
    {
      category: 'Carbon',
      inputType: 'dropdown',
      type: 'user',
      value: 1,
    },
    {
      category: 'Finance',
      inputType: 'dropdown',
      type: 'user',
      value: 1,
    },
    {
      category: 'Forestry',
      inputType: 'dropdown',
      type: 'user',
      value: -1,
    },
    {
      category: 'Legal',
      inputType: 'dropdown',
      type: 'user',
      value: 1,
    },
  ],
};

const OverviewView = () => {
  const { isMobile } = useDeviceInfo();
  const history = useHistory();
  const theme = useTheme();
  const [qualitativeInfo, setQualitativeInfo] = useState(mockQualitativeInfo);

  const onChange = (value: unknown) => {
    // tslint:disable:no-console
    console.log('onChange - value:', value);
  };

  const onChangeText = (id: string, value: unknown) => {
    // tslint:disable:no-console
    console.log('TextArea onChange - id:', id);
    // tslint:disable:no-console
    console.log('TextArea onChange - value:', value);
    setQualitativeInfo(value as string);
  };

  const goToNewCohort = () => {
    history.push(APP_PATHS.ACCELERATOR_COHORTS_NEW);
  };

  return (
    <Page
      title={strings.ACCELERATOR_CONSOLE}
      rightComponent={
        isMobile ? (
          <Button id='new-cohort' icon='plus' onClick={goToNewCohort} size='medium' />
        ) : (
          <Button id='new-cohort' label={strings.ADD_COHORT} icon='plus' onClick={goToNewCohort} size='medium' />
        )
      }
    >
      <Grid container spacing={theme.spacing(2)}>
        <Grid item xs={6}>
          {mockScorecard.scores.map((score, index) => (
            <ScoreEntry
              key={index}
              disabled={true}
              onChange={onChange}
              onChangeText={onChangeText}
              phase={mockScorecard.phase}
              qualitativeInfo={qualitativeInfo}
              score={score}
            />
          ))}
        </Grid>
        <Grid item xs={6}>
          {mockScorecard2.scores.map((score, index) => (
            <ScoreEntry
              key={index}
              onChange={onChange}
              onChangeText={onChangeText}
              phase={mockScorecard.phase}
              qualitativeInfo={qualitativeInfo}
              score={score}
            />
          ))}
        </Grid>
      </Grid>
    </Page>
  );
};

export default OverviewView;
