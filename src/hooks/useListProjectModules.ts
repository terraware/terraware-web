import { useCallback, useMemo } from 'react';

import { useLazyListProjectModulesQuery } from '../queries/generated/projectModules';

const useListProjectModules = () => {
  const [listProjectModulesQuery, listModulesResult] = useLazyListProjectModulesQuery();

  const listProjectModules = useCallback(
    (projectId: number) => {
      void listProjectModulesQuery(projectId);
    },
    [listProjectModulesQuery]
  );

  const projectModules = useMemo(
    () => (listModulesResult.isSuccess ? listModulesResult.data.modules ?? [] : []),
    [listModulesResult.isSuccess, listModulesResult.data]
  );

  return useMemo(
    () => ({
      listProjectModules,
      isLoading: listModulesResult.isLoading,
      projectModules,
    }),
    [listProjectModules, listModulesResult.isLoading, projectModules]
  );
};

export default useListProjectModules;
