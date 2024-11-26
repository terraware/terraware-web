import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestListCohortModules } from 'src/redux/features/cohortModules/cohortModulesAsyncThunks';
import { selectCohortModuleList } from 'src/redux/features/cohortModules/cohortModulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { CohortModule } from 'src/types/Module';

const useListCohortModules = () => {
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState<string>('');
  const [cohortModules, setCohortModules] = useState<CohortModule[]>([]);
  const listModulesResponse = useAppSelector(selectCohortModuleList(requestId));

  const listCohortModules = useCallback(
    (cohortId: number) => {
      const dispatched = dispatch(requestListCohortModules({ cohortId }));
      setRequestId(dispatched.requestId);
    },
    [dispatch, setRequestId]
  );

  useEffect(() => {
    if (listModulesResponse && listModulesResponse.status === 'success') {
      setCohortModules(listModulesResponse.data ?? []);
    }
  }, [listModulesResponse, setCohortModules]);

  return useMemo(
    () => ({
      listCohortModules,
      status: listModulesResponse?.status,
      cohortModules,
    }),
    [listCohortModules, listModulesResponse?.status, cohortModules]
  );
};

export default useListCohortModules;
