import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response, Response2 } from 'src/services/HttpService';
import { Score } from 'src/types/Score';

const ENDPOINT_SCORES = '/api/v2/accelerator/projects/{projectId}/scores';

export type GetProjectScoresResponsePayload =
  paths[typeof ENDPOINT_SCORES]['get']['responses'][200]['content']['application/json'];

export type UpdateProjectScoresRequestPayload =
  paths[typeof ENDPOINT_SCORES]['put']['requestBody']['content']['application/json'];

const httpScores = HttpService.root(ENDPOINT_SCORES);

const get = async (projectId: number): Promise<Response2<GetProjectScoresResponsePayload>> =>
  httpScores.get2<GetProjectScoresResponsePayload>({
    urlReplacements: {
      '{projectId}': `${projectId}`,
    },
  });

const update = async (projectId: number, score: Score): Promise<Response> => {
  return httpScores.put({
    urlReplacements: {
      '{projectId}': `${projectId}`,
    },
    entity: { score },
  });
};

const ScoreService = {
  get,
  update,
};

export default ScoreService;
