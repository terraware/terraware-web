import { useCallback, useMemo, useState } from 'react';

import { requestGetEvent } from 'src/redux/features/events/eventsAsyncThunks';
import { selectEventRequest } from 'src/redux/features/events/eventsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

const useGetEvent = () => {
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState<string>('');
  const getEventResponse = useAppSelector(selectEventRequest(requestId));

  const getEvent = useCallback(
    (eventId: number) => {
      const dispatched = dispatch(requestGetEvent(eventId));
      setRequestId(dispatched.requestId);
    },
    [dispatch, setRequestId]
  );

  const event = useMemo(
    () => (getEventResponse?.status === 'success' ? getEventResponse.data : undefined),
    [getEventResponse]
  );

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
