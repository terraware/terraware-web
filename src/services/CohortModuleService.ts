import { paths } from 'src/api/types/generated-schema';
import { UpdateCohortModuleRequest } from 'src/types/Module';

import HttpService, { Response, Response2 } from './HttpService';

const COHORT_MODULES_ENDOINT = '/api/v1/accelerator/cohorts/{cohortId}/modules';
const COHORT_MODULE_ENDOINT = '/api/v1/accelerator/cohorts/{cohortId}/modules/{moduleId}';

export type ListCohortModulesResponsePayload =
  paths[typeof COHORT_MODULES_ENDOINT]['get']['responses'][200]['content']['application/json'];
export type GetCohortModuleResponsePayload =
  paths[typeof COHORT_MODULE_ENDOINT]['get']['responses'][200]['content']['application/json'];

/**
 * List cohort modules
 */
const list = (cohortId: number): Promise<Response2<ListCohortModulesResponsePayload>> => {
  return HttpService.root(COHORT_MODULES_ENDOINT).get2<ListCohortModulesResponsePayload>({
    url: COHORT_MODULES_ENDOINT,
    urlReplacements: { '{cohortId}': `${cohortId}` },
  });
};

/**
 * Get one cohort module
 */
const get = (cohortId: number, moduleId: number): Promise<Response2<GetCohortModuleResponsePayload>> => {
  return HttpService.root(COHORT_MODULE_ENDOINT).get2<GetCohortModuleResponsePayload>({
    url: COHORT_MODULES_ENDOINT,
    urlReplacements: { '{cohortId}': `${cohortId}`, '{moduleId}': `${moduleId}` },
  });
};

/**
 * Delete cohort module
 */
const deleteOne = async (moduleId: number, cohortId: number): Promise<Response> =>
  await HttpService.root(COHORT_MODULE_ENDOINT).delete({
    urlReplacements: { '{cohortId}': `${cohortId}`, '{moduleId}': `${moduleId}` },
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
    urlReplacements: { '{cohortId}': `${cohortId}`, '{moduleId}': `${moduleId}` },
    entity,
  });

const CohortModuleService = {
  list,
  get,
  deleteOne,
  update,
};

export default CohortModuleService;
