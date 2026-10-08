import { useMemo } from 'react';

import { useListEventsQuery } from 'src/queries/generated/moduleEvents';
import { useGetModuleQuery } from 'src/queries/generated/modules';

const useGetModule = (moduleId: number) => {
  const { currentData: moduleData } = useGetModuleQuery(moduleId);
  const { currentData: eventsData } = useListEventsQuery({ moduleId });

  return useMemo(() => ({ module: moduleData?.module, events: eventsData?.events }), [moduleData, eventsData]);
};

export default useGetModule;
