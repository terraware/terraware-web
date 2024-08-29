import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestGetEvent } from 'src/redux/features/events/eventsAsyncThunks';
import { selectEventRequest } from 'src/redux/features/events/eventsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ModuleEvent } from 'src/types/Module';

const useGetEvent = () => {
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState<string>('');
  const [event, setEvent] = useState<ModuleEvent>();
  const getEventResponse = useAppSelector(selectEventRequest(requestId));

  const getEvent = useCallback(
    (eventId: number) => {
      const dispatched = dispatch(requestGetEvent(eventId));
      setRequestId(dispatched.requestId);
    },
    [dispatch, setRequestId]
  );

  useEffect(() => {
    if (getEventResponse && getEventResponse.status === 'success') {
      setEvent(getEventResponse.data);
    }
  }, [getEventResponse, setEvent]);

  return useMemo(
    () => ({
      event,
      status: getEventResponse?.status,
      getEvent,
    }),
    [event, getEventResponse?.status, getEvent]
  );
};

export default useGetEvent;
