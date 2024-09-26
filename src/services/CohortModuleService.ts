import { UpdateCohortModuleRequest } from 'src/types/Module';

import HttpService, { Response } from './HttpService';

const COHORT_MODULE_ENDOINT = '/api/v1/accelerator/cohorts/{cohortId}/modules/{moduleId}';

/**
 * Delete cohort module
 */
const deleteOne = async (moduleId: number, cohortId: number): Promise<Response> =>
  await HttpService.root(COHORT_MODULE_ENDOINT).delete({
    urlReplacements: { '{moduleId}': `${moduleId}`, '{cohortId}': `${cohortId}` },
  });

/**
 * Update cohort module
 */
const update = async ({
  moduleId,
  cohortId,
  entity,
}: {
  moduleId: number;
  cohortId: number;
  entity: UpdateCohortModuleRequest;
}): Promise<Response> =>
  await HttpService.root(COHORT_MODULE_ENDOINT).put({
    urlReplacements: { '{moduleId}': `${moduleId}`, '{cohortId}': `${cohortId}` },
    entity,
  });

const CohortModuleService = {
  deleteOne,
  update,
};

export default CohortModuleService;
