import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestListEvents } from 'src/redux/features/events/eventsAsyncThunks';
import { selectEventList } from 'src/redux/features/events/eventsSelectors';
import { requestGetModule } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleRequest } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Module, ModuleEvent } from 'src/types/Module';

const useGetModule = (moduleId: number) => {
  const dispatch = useAppDispatch();

  const [moduleRequestId, setModuleRequestId] = useState<string>('');
  const [evenstRequestId, setEventsRequestId] = useState<string>('');

  const getModuleResponse = useAppSelector(selectModuleRequest(moduleRequestId));
  const listModuleEventsResponse = useAppSelector(selectEventList(evenstRequestId));

  const getModule = useCallback(() => {
    const moduleRequest = dispatch(requestGetModule({ moduleId }));
    const eventsRequest = dispatch(requestListEvents({ moduleId }));
    setModuleRequestId(moduleRequest.requestId);
    setEventsRequestId(eventsRequest.requestId);
  }, [dispatch, moduleId, setEventsRequestId, setModuleRequestId]);

  useEffect(() => {
    getModule();
  }, [getModule]);

  const module = useMemo<Module | undefined>(
    () => (getModuleResponse?.status === 'success' ? getModuleResponse.data : undefined),
    [getModuleResponse]
  );

  const events = useMemo<ModuleEvent[] | undefined>(
    () => (listModuleEventsResponse?.status === 'success' ? listModuleEventsResponse.data : undefined),
    [listModuleEventsResponse]
  );

  return useMemo(
    () => ({
      module,
      events,
      getModule,
    }),
    [module, events, getModule]
  );
};

export default useGetModule;
