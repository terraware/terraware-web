import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLocalization } from 'src/providers/hooks';
import { requestListDeliverables } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesSearchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ListDeliverablesElementWithOverdue } from 'src/types/Deliverables';

const useProjectModuleDeliverables = () => {
  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();

  const [deliverablesRequestId, setDeliverablesRequestId] = useState<string>('');
  const [deliverables, setDeliverables] = useState<ListDeliverablesElementWithOverdue[]>();

  const listModuleDeliverablesResponse = useAppSelector(selectDeliverablesSearchRequest(deliverablesRequestId));

  const listProjectModuleDeliverables = useCallback(
    (request: { projectId: number; moduleId: number }) => {
      const listModuleDeliverables = dispatch(
        requestListDeliverables({
          locale: activeLocale,
          listRequest: {
            moduleId: request.moduleId,
            projectId: request.projectId,
          },
        })
      );

      setDeliverablesRequestId(listModuleDeliverables.requestId);
    },
    [dispatch, setDeliverablesRequestId]
  );

  useEffect(() => {
    if (listModuleDeliverablesResponse && listModuleDeliverablesResponse.status === 'success') {
      setDeliverables(listModuleDeliverablesResponse.data);
    }
  }, [listModuleDeliverablesResponse, setDeliverables]);

  return useMemo(
    () => ({
      deliverables,
      listProjectModuleDeliverables,
    }),
    [listProjectModuleDeliverables, deliverables]
  );
};

export default useProjectModuleDeliverables;
