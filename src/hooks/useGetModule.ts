import { useEffect, useMemo, useState } from 'react';

import { useGetModuleQuery } from 'src/queries/generated/modules';
import { requestListEvents } from 'src/redux/features/events/eventsAsyncThunks';
import { selectEventList } from 'src/redux/features/events/eventsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ModuleEvent } from 'src/types/Module';

const useGetModule = (moduleId: number) => {
  const dispatch = useAppDispatch();
  const { currentData: moduleData } = useGetModuleQuery(moduleId);

  const [eventsRequestId, setEventsRequestId] = useState<string>('');
  const listModuleEventsResponse = useAppSelector(selectEventList(eventsRequestId));

  useEffect(() => {
    const eventsRequest = dispatch(requestListEvents({ moduleId }));
    setEventsRequestId(eventsRequest.requestId);
  }, [dispatch, moduleId]);

  const events = useMemo<ModuleEvent[] | undefined>(
    () => (listModuleEventsResponse?.status === 'success' ? listModuleEventsResponse.data : undefined),
    [listModuleEventsResponse]
  );

  return useMemo(() => ({ module: moduleData?.module, events }), [moduleData, events]);
};

export default useGetModule;
