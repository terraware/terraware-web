import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLazyGetProjectModuleQuery } from 'src/queries/generated/projectModules';
import { ProjectModule } from 'src/types/Module';

const useGetProjectModule = () => {
  const [getProjectModuleQuery, projectModuleResult] = useLazyGetProjectModuleQuery();

  const [projectModule, setProjectModule] = useState<ProjectModule>();

  const getProjectModule = useCallback(
    (request: { projectId: number; moduleId: number }) => {
      void getProjectModuleQuery(request);
    },
    [getProjectModuleQuery]
  );

  useEffect(() => {
    if (projectModuleResult.isSuccess) {
      setProjectModule(projectModuleResult.data.module);
    }
  }, [projectModuleResult, setProjectModule]);

  return useMemo(
    () => ({
      projectModule,
      getProjectModule,
    }),
    [getProjectModule, projectModule]
  );
};

export default useGetProjectModule;
