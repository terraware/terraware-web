import { useCallback, useMemo, useState } from 'react';

import { requestListEvents } from 'src/redux/features/events/eventsAsyncThunks';
import { selectEventList } from 'src/redux/features/events/eventsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

const useProjectModuleEvents = () => {
  const dispatch = useAppDispatch();

  const [eventsRequestId, setEventsRequestId] = useState<string>('');
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

  const events = useMemo(
    () => (listModuleEventsResponse?.status === 'success' ? listModuleEventsResponse.data : undefined),
    [listModuleEventsResponse]
  );

  return useMemo(
    () => ({
      events,
      listProjectModuleEvents,
    }),
    [events, listProjectModuleEvents]
  );
};

export default useProjectModuleEvents;
