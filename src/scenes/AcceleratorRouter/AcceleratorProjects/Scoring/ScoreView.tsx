import React, { useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import useNavigateTo from 'src/hooks/useNavigateTo';
import useProjectScore from 'src/hooks/useProjectScore';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import { useAcceleratorProjectData } from '../AcceleratorProjectContext';
import ScoreCard from './ScoreCard';
import ScoringWrapper from './ScoringWrapper';

const ScoreView = () => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { project, projectId } = useAcceleratorProjectData();
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

  return (
    <ScoringWrapper isLoading={getStatus === 'pending'} rightComponent={rightComponent}>
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
      {projectScore && <ScoreCard score={projectScore} />}
    </ScoringWrapper>
  );
};

export default ScoreView;
