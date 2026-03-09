import { useCallback, useMemo } from 'react';

import { useLazyGetProjectModuleQuery } from 'src/queries/generated/projectModules';

const useGetProjectModule = () => {
  const [getProjectModuleQuery, projectModuleResult] = useLazyGetProjectModuleQuery();

  const getProjectModule = useCallback(
    (request: { projectId: number; moduleId: number }) => {
      void getProjectModuleQuery(request);
    },
    [getProjectModuleQuery]
  );

  const projectModule = useMemo(
    () => (projectModuleResult.isSuccess ? projectModuleResult.data.module : undefined),
    [projectModuleResult.isSuccess, projectModuleResult.data]
  );

  return useMemo(
    () => ({
      projectModule,
      getProjectModule,
    }),
    [getProjectModule, projectModule]
  );
};

export default useGetProjectModule;
