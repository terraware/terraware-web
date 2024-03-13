import { components } from 'src/api/types/generated-schema';
import { Response } from 'src/services/HttpService';
import { Score, Scorecard, ScoresData } from 'src/types/Score';

/**
 * Accelerator project scoring related services
 */

// This will all be updated when the backend API is done

// const ENDPOINT_SCORES = '/api/v1/accelerator/scores/:projectId';

export type ListScoresResponsePayload = {
  scores: Score[];
};

export type UpdateScoresRequestPayload = {
  scores: Score[];
};
export type UpdateScoresResponsePayload = Response & components['schemas']['SimpleSuccessResponsePayload'];

// const httpScores = HttpService.root(ENDPOINT_SCORES);

let mockScorecards: Scorecard[] = [
  {
    phase: 'Phase 0',
    scores: [
      {
        category: 'Calculated',
        value: 1.5,
        type: 'system',
        inputType: 'number',
      },
      {
        category: 'Carbon',
        value: 1,
        type: 'user',
        inputType: 'dropdown',
      },
      {
        category: 'Carbon',
        value: 'Good project with good folks ready to do good work... almost perfect',
        type: 'user',
        inputType: 'text',
      },
      {
        category: 'Finance',
        value: 2,
        type: 'user',
        inputType: 'dropdown',
      },
      {
        category: 'Finance',
        value: 'Excellent finances, great opportunity',
        type: 'user',
        inputType: 'text',
      },
    ],
  },
  {
    phase: 'Phase 1',
    scores: [
      {
        category: 'Calculated',
        value: null,
        type: 'system',
        inputType: 'number',
      },
      {
        category: 'Carbon',
        value: null,
        type: 'user',
        inputType: 'dropdown',
      },
      {
        category: 'Carbon',
        value: null,
        type: 'user',
        inputType: 'text',
      },
      {
        category: 'Finance',
        value: null,
        type: 'user',
        inputType: 'dropdown',
      },
      {
        category: 'Finance',
        value: null,
        type: 'user',
        inputType: 'text',
      },
    ],
  },
];

const list = async (projectId: number): Promise<Response & ScoresData> => {
  // httpScores.get<ListScoresResponsePayload, ScoresData>(
  //   {
  //     urlReplacements: {
  //       '{projectId}': `${projectId}`,
  //     },
  //   },
  //   (response) => ({ scores: response?.scores })
  // );

  // These are just here until the BE API is implemented and we actually use `projectId` in the request
  // tslint:disable:no-console
  console.log('projectId', projectId);

  return {
    requestSucceeded: true,
    scorecards: mockScorecards,
  };
};

const update = async (projectId: number, scores: Score[]): Promise<UpdateScoresResponsePayload> => {
  const payload: UpdateScoresRequestPayload = {
    scores,
  };

  // These are just here until the BE API is implemented and we actually use `projectId` in the request
  // tslint:disable:no-console
  console.log('projectId', projectId);

  // httpScores.post2<UpdateScoresResponsePayload>(
  //   {
  //     urlReplacements: {
  //       '{projectId}': `${projectId}`,
  //     },
  //   },
  //   entity: payload,
  // );

  // This goes away when the BE API is created
  payload.scores.forEach((score: Score) => {
    mockScorecards = mockScorecards.map((scorecard: Scorecard) => {
      return {
        ...scorecard,
        scores: scorecard.scores.map((_score: Score) => {
          if (_score.category !== score.category && _score.type !== score.type) {
            return _score;
          }
          return score;
        }),
      };
    });
  });

  return {
    requestSucceeded: true,
    status: 'ok',
  };
};

const ScoreService = {
  list,
  update,
};

export default ScoreService;
