import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestListEvents } from 'src/redux/features/events/eventsAsyncThunks';
import { selectEventList } from 'src/redux/features/events/eventsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ModuleEvent } from 'src/types/Module';

const useProjectModuleEvents = () => {
  const dispatch = useAppDispatch();

  const [eventsRequestId, setEventsRequestId] = useState<string>('');
  const [events, setEvents] = useState<ModuleEvent[]>();
  const listModuleEventsResponse = useAppSelector(selectEventList(eventsRequestId));

  const listProjectModuleEvents = useCallback(
    (request: { projectId: number; moduleId: number }) => {
      const listModuleEvents = dispatch(
        requestListEvents({
          moduleId: request.moduleId,
          projectId: request.projectId,
        })
      );
      setEventsRequestId(listModuleEvents.requestId);
    },
    [dispatch, setEventsRequestId]
  );

  useEffect(() => {
    if (listModuleEventsResponse && listModuleEventsResponse.status === 'success') {
      setEvents(listModuleEventsResponse.data);
    }
  }, [listModuleEventsResponse, setEvents]);

  return useMemo(
    () => ({
      events,
      listProjectModuleEvents,
    }),
    [events, listProjectModuleEvents]
  );
};

export default useProjectModuleEvents;
