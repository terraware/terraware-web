import { useCallback, useMemo } from 'react';

import { useLazyGetEventQuery } from 'src/queries/generated/moduleEvents';

const useGetEvent = () => {
  const [getEventQuery, getEventResult] = useLazyGetEventQuery();

  const getEvent = useCallback(
    (eventId: number) => {
      void getEventQuery(eventId, true);
    },
    [getEventQuery]
  );

  return useMemo(
    () => ({ event: getEventResult.currentData?.event, getEvent }),
    [getEventResult.currentData, getEvent]
  );
};

export default useGetEvent;
