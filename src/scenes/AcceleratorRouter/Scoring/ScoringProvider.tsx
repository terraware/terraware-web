import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { selectProject } from 'src/redux/features/projects/projectsSelectors';
import { requestProject } from 'src/redux/features/projects/projectsThunks';
import { requestListScores } from 'src/redux/features/scores/scoresAsyncThunks';
import { selectScoreList } from 'src/redux/features/scores/scoresSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { PhaseScores } from 'src/types/Score';
import useSnackbar from 'src/utils/useSnackbar';

import { ScoringContext, ScoringData } from './ScoringContext';

export type Props = {
  children: React.ReactNode;
};

const ScoringProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const project = useAppSelector(selectProject(projectId));

  const [projectName, setProjectName] = useState('');
  const [phaseScores, setPhaseScores] = useState<PhaseScores[]>();
  const [scoringData, setScoringData] = useState<ScoringData>({ crumbs: [], projectId });

  const scoreListResult = useAppSelector(selectScoreList(projectId));

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              name: strings.PROJECTS,
              to: `${APP_PATHS.ACCELERATOR_OVERVIEW}?tab=projects`,
            },
            {
              name: projectName || '',
              to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`),
            },
          ]
        : [],
    [activeLocale, projectId, projectName]
  );

  const phase0Scores = useMemo(
    () => phaseScores?.find((phaseScore: PhaseScores) => phaseScore.phase === 'Phase 0 - Due Diligence'),
    [phaseScores]
  );

  const phase1Scores = useMemo(
    () => phaseScores?.find((phaseScore: PhaseScores) => phaseScore.phase === 'Phase 1 - Feasibility Study'),
    [phaseScores]
  );

  useEffect(() => {
    if (!isNaN(projectId)) {
      void dispatch(requestProject(projectId));
      dispatch(requestListScores(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (project) {
      setProjectName(project.name);
    }
  }, [project]);

  useEffect(() => {
    if (!scoreListResult) {
      return;
    }

    if (scoreListResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    } else if (scoreListResult?.status === 'success' && scoreListResult?.data?.phases) {
      setPhaseScores(scoreListResult.data.phases);
    }
  }, [scoreListResult, snackbar]);

  useEffect(() => {
    setScoringData({
      crumbs,
      phase0Scores,
      phase1Scores,
      projectId,
      projectName,
      status: scoreListResult?.status ?? 'pending',
    });
  }, [crumbs, phase0Scores, phase1Scores, projectId, projectName, scoreListResult]);

  return <ScoringContext.Provider value={scoringData}>{children}</ScoringContext.Provider>;
};

export default ScoringProvider;
