import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response, Response2 } from 'src/services/HttpService';
import { Phase, PhaseScores, Score, ScoreCategories, ScoreCategory, ScorePhases, ScoresData } from 'src/types/Score';

/**
 * Accelerator project scoring related services
 */

const ENDPOINT_SCORES = '/api/v1/accelerator/projects/{projectId}/scores';

export type GetProjectScoresResponsePayload =
  paths[typeof ENDPOINT_SCORES]['get']['responses'][200]['content']['application/json'];

export type UpsertProjectScoresRequestPayload =
  paths[typeof ENDPOINT_SCORES]['put']['requestBody']['content']['application/json'];
export type UpsertProjectScoresResponsePayload =
  paths[typeof ENDPOINT_SCORES]['put']['responses'][200]['content']['application/json'];

const httpScores = HttpService.root(ENDPOINT_SCORES);

const get = async (projectId: number): Promise<Response & ScoresData> =>
  httpScores.get<GetProjectScoresResponsePayload, ScoresData>(
    {
      urlReplacements: {
        '{projectId}': `${projectId}`,
      },
    },
    (response) => ({
      // Since score phases may not exist, but we need to be able to edit them, fill in the
      // missing phases with "empty" phase scores
      phases: ScorePhases.map((expectedPhase: Phase) => {
        const phase = response?.phases.find((phaseScore: PhaseScores) => phaseScore.phase === expectedPhase) || {
          phase: expectedPhase,
          scores: [],
        };

        return {
          ...phase,
          // Since scores may not exist, but we need to be able to edit them, fill in the
          // missing score categories with "empty" scores
          scores: ScoreCategories.map((expectedScoreCategory: ScoreCategory): Score => {
            const score = phase.scores.find((score: Score) => score.category === expectedScoreCategory);
            if (score) {
              return score;
            }
            return {
              category: expectedScoreCategory,
              modifiedTime: '',
            };
          }),
        };
      }),
    })
  );

const update = async (
  projectId: number,
  phase: Phase,
  scores: Score[]
): Promise<Response2<UpsertProjectScoresResponsePayload>> => {
  const payload: UpsertProjectScoresRequestPayload = {
    phase,
    scores,
  };

  return httpScores.put2<UpsertProjectScoresResponsePayload>({
    urlReplacements: {
      '{projectId}': `${projectId}`,
    },
    entity: payload,
  });
};

const ScoreService = {
  get,
  update,
};

export default ScoreService;
