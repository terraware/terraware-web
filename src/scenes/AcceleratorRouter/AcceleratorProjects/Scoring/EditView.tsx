import React, { useCallback, useEffect } from 'react';

import PageForm from 'src/components/common/PageForm';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useProjectScore from 'src/hooks/useProjectScore';
import { Score } from 'src/types/Score';
import useForm from 'src/utils/useForm';

import { useAcceleratorProjectData } from '../AcceleratorProjectContext';
import ScoreCard from './ScoreCard';
import ScoringWrapper from './ScoringWrapper';

const ScorecardEditView = () => {
  const { goToAcceleratorProjectScore } = useNavigateTo();

  const { project, projectId } = useAcceleratorProjectData();
  const { projectScore, updateProjectScore, updateStatus, getStatus } = useProjectScore(projectId);
  const [score, setScore, onChange] = useForm<Score>({});

  useEffect(() => {
    if (getStatus === 'success' && projectScore) {
      setScore(projectScore);
    }
  }, [getStatus, projectScore, setScore]);

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
        {projectScore && <ScoreCard score={score} isEditing onChange={onChange} />}
      </PageForm>
    </ScoringWrapper>
  );
};

export default ScorecardEditView;
