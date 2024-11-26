import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestGetCohortModule } from 'src/redux/features/cohortModules/cohortModulesAsyncThunks';
import { selectCohortModuleRequest } from 'src/redux/features/cohortModules/cohortModulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { CohortModule } from 'src/types/Module';

const useGetCohortModule = () => {
  const dispatch = useAppDispatch();

  const [moduleRequestId, setModuleRequestId] = useState<string>('');
  const [cohortModule, setCohortModule] = useState<CohortModule>();

  const getModuleResponse = useAppSelector(selectCohortModuleRequest(moduleRequestId));

  const getCohortModule = useCallback(
    (request: { cohortId: number; moduleId: number }) => {
      const getModule = dispatch(requestGetCohortModule(request));
      setModuleRequestId(getModule.requestId);
    },
    [dispatch, setModuleRequestId]
  );

  useEffect(() => {
    if (getModuleResponse && getModuleResponse.status === 'success') {
      setCohortModule(getModuleResponse.data);
    }
  }, [getModuleResponse, setCohortModule]);

  return useMemo(
    () => ({
      cohortModule,
      getCohortModule,
    }),
    [getCohortModule, cohortModule]
  );
};

export default useGetCohortModule;
