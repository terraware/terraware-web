import { useCallback, useEffect, useMemo, useState } from 'react';

import { ProjectModule } from 'src/types/Module';

import { useLazyListProjectModulesQuery } from '../queries/generated/projectModules';

const useListProjectModules = () => {
  const [listProjectModulesQuery, listModulesResult] = useLazyListProjectModulesQuery();

  const [projectModules, setProjectModules] = useState<ProjectModule[]>([]);

  const listProjectModules = useCallback(
    (projectId: number) => {
      void listProjectModulesQuery(projectId);
    },
    [listProjectModulesQuery]
  );

  useEffect(() => {
    if (listModulesResult.isSuccess) {
      setProjectModules(listModulesResult.data.modules ?? []);
    }
  }, [listModulesResult, setProjectModules]);

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
