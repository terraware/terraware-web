import React, { useCallback, useEffect } from 'react';

import { Box, TextField, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useProjectScore from 'src/hooks/useProjectScore';
import strings from 'src/strings';
import { Score } from 'src/types/Score';
import useForm from 'src/utils/useForm';

import { useParticipantProjectData } from '../ParticipantProjectContext';
import ScoringWrapper from './ScoringWrapper';

const ScorecardEditView = () => {
  const theme = useTheme();
  const { goToAcceleratorProjectScore } = useNavigateTo();

  const { project, projectId } = useParticipantProjectData();
  const { projectScore, updateProjectScore, updateStatus, getStatus } = useProjectScore(projectId);
  const [score, setScore, onChange] = useForm<Score>({});

  useEffect(() => {
    if (getStatus === 'success' && projectScore) {
      setScore(projectScore);
    }
  }, [getStatus, projectScore]);

  const onExit = useCallback(() => {
    if (project) {
      goToAcceleratorProjectScore(project.id);
    }
  }, [goToAcceleratorProjectScore, project]);

  const onSave = useCallback(() => {
    if (
      score.detailsUrl === projectScore?.detailsUrl &&
      score.overallScore === projectScore?.overallScore &&
      score.summary === projectScore?.summary
    ) {
      onExit();
      return;
    }

    updateProjectScore(score);
  }, [onExit, score, projectScore, updateProjectScore]);

  useEffect(() => {
    if (updateStatus === 'success') {
      onExit();
    }
  }, [updateStatus, onExit]);

  return (
    <ScoringWrapper isForm isLoading={updateStatus === 'pending'}>
      <PageForm
        busy={updateStatus === 'pending'}
        cancelID='cancelEditScorecard'
        onCancel={onExit}
        onSave={onSave}
        saveID='saveEditScorecard'
        style={{ width: '100%' }}
      >
        <Card
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            padding: theme.spacing(0, 3, 10),
          }}
        >
          <Box sx={{ alignItems: 'center' }}>
            <Typography>{strings.SCORE}</Typography>
          </Box>
          <TextField
            label={strings.ORGANIZATION_NAME_REQUIRED}
            type='text'
            id='name'
            onChange={(value) => {
              onChange('summary', value);
            }}
            value={score.summary}
          />
        </Card>
      </PageForm>
    </ScoringWrapper>
  );
};

export default ScorecardEditView;
