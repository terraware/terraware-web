import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLocalization } from 'src/providers';
import { requestListDeliverables } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesSearchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { requestListModules } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleList } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ListModulesRequestParam } from 'src/services/ModuleService';
import { ListDeliverablesElementWithOverdue } from 'src/types/Deliverables';
import { Module } from 'src/types/Module';

const useListModules = () => {
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState<string>('');
  const [deliverablesRequestId, setDeliverablesRequestId] = useState<string>('');
  const [modules, setModules] = useState<Module[]>();
  const listModulesResponse = useAppSelector(selectModuleList(requestId));
  const { activeLocale } = useLocalization();
  const allDeliverablesResponse = useAppSelector(selectDeliverablesSearchRequest(deliverablesRequestId));
  const [deliverablesByModuleId, setDeliverablesByModuleId] =
    useState<Record<number, ListDeliverablesElementWithOverdue[]>>();

  const listModules = useCallback(
    (request?: ListModulesRequestParam) => {
      const dispatched = dispatch(requestListModules(request || {}));
      setRequestId(dispatched.requestId);
    },
    [dispatch, setRequestId]
  );

  const listDeliverables = useCallback(() => {
    const dispatched = dispatch(requestListDeliverables({ locale: activeLocale }));
    setDeliverablesRequestId(dispatched.requestId);
  }, [dispatch, setDeliverablesRequestId]);

  useEffect(() => {
    listModules();
  }, [dispatch]);

  useEffect(() => {
    if (listModulesResponse && allDeliverablesResponse.status === 'success') {
      const deliverables = allDeliverablesResponse.data;
      const _deliverablesByModuleId: Record<number, ListDeliverablesElementWithOverdue[]> = {};
      deliverables?.forEach((_deliverable) => {
        const moduleId = _deliverable.moduleId;
        if (_deliverablesByModuleId[moduleId]) {
          if (
            _deliverablesByModuleId[moduleId].every((existingDeliverable) => existingDeliverable.id !== _deliverable.id)
          ) {
            _deliverablesByModuleId[moduleId] = [..._deliverablesByModuleId[moduleId], _deliverable];
          }
        } else {
          _deliverablesByModuleId[moduleId] = [_deliverable];
        }
      });

      setDeliverablesByModuleId(_deliverablesByModuleId);
    }
  }, [allDeliverablesResponse]);

  useEffect(() => {
    if (listModulesResponse && listModulesResponse.status === 'success') {
      setModules(listModulesResponse.data ?? []);
    }
  }, [listModulesResponse, setModules]);

  return useMemo(
    () => ({
      listModules,
      listDeliverables,
      status: listModulesResponse?.status,
      modules,
      deliverablesByModuleId,
    }),
    [listModules, listModulesResponse?.status, modules, deliverablesByModuleId]
  );
};

export default useListModules;
