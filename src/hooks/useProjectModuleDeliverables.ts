import { useCallback, useMemo } from 'react';

import { useLazyListDeliverablesQuery } from 'src/queries/generated/deliverables';
import { withOverdueStatus } from 'src/types/Deliverables';

const useProjectModuleDeliverables = () => {
  const [listDeliverablesQuery, listDeliverablesResult] = useLazyListDeliverablesQuery();

  const listProjectModuleDeliverables = useCallback(
    (request: { projectId: number; moduleId: number }) => {
      void listDeliverablesQuery({ moduleId: request.moduleId, projectId: request.projectId }, true);
    },
    [listDeliverablesQuery]
  );

  const deliverables = useMemo(
    () => listDeliverablesResult.currentData?.deliverables.map(withOverdueStatus),
    [listDeliverablesResult.currentData]
  );

  return useMemo(
    () => ({ deliverables, listProjectModuleDeliverables }),
    [listProjectModuleDeliverables, deliverables]
  );
};

export default useProjectModuleDeliverables;
