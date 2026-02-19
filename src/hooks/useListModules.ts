import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestListModules } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleList } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Module } from 'src/types/Module';

const useListModules = () => {
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const listModulesResponse = useAppSelector(selectModuleList(requestId));

  const listModules = useCallback(() => {
    const dispatched = dispatch(requestListModules());
    setRequestId(dispatched.requestId);
  }, [dispatch, setRequestId]);

  useEffect(() => {
    if (listModulesResponse && listModulesResponse.status === 'success') {
      setModules(listModulesResponse.data ?? []);
    }
  }, [listModulesResponse, setModules]);

  return useMemo(
    () => ({
      listModules,
      status: listModulesResponse?.status,
      modules,
    }),
    [listModules, listModulesResponse?.status, modules]
  );
};

export default useListModules;
