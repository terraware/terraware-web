import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getModuleProjects: build.query<ModuleProject[], number | string>({
      query: (moduleId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'modules',
          fields: [
            'projectModules_project_id',
            'projectModules_project_name',
            'projectModules_startDate',
            'projectModules_endDate',
          ],
          search: {
            operation: 'field',
            field: 'id',
            type: 'Exact',
            values: [moduleId.toString()],
          },
        },
      }),
      transformResponse: (results: GetModuleProjectsApiResponse) =>
        results.results.map((result) => ({
          projectId: Number(result.projectModules_project_id),
          projectName: result.projectModules_project_name,
          startDate: result.projectModules_startDate,
          endDate: result.projectModules_endDate,
        })),
    }),
  }),
});

type ModulesProjectApiResult = {
  projectModules_project_id: string;
  projectModules_project_name: string;
  projectModules_startDate: string;
  projectModules_endDate: string;
};

type GetModuleProjectsApiResponse = {
  results: ModulesProjectApiResult[];
};

export type ModuleProject = {
  projectId: number;
  projectName: string;
  startDate: string;
  endDate: string;
};

export { injectedRtkApi as api };

export const { useGetModuleProjectsQuery, useLazyGetModuleProjectsQuery } = injectedRtkApi;
