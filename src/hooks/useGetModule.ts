import { useCallback, useEffect, useMemo, useState } from 'react';

import { requestListDeliverables } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import { selectDeliverablesSearchRequest } from 'src/redux/features/deliverables/deliverablesSelectors';
import { requestListEvents } from 'src/redux/features/events/eventsAsyncThunks';
import { selectEventList } from 'src/redux/features/events/eventsSelectors';
import { requestGetModule } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleRequest } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { GetModuleRequestParam } from 'src/services/ModuleService';
import { ListDeliverablesElementWithOverdue } from 'src/types/Deliverables';
import { Module, ModuleEvent } from 'src/types/Module';

import { useLocalization } from '../providers/hooks';

const useGetModule = () => {
  const { activeLocale } = useLocalization();
  const dispatch = useAppDispatch();

  const [moduleRequestId, setModuleRequestId] = useState<string>('');
  const [deliverablesRequestId, setDeliverablesRequestId] = useState<string>('');
  const [eventsRequestId, setEventsRequestId] = useState<string>('');

  const [module, setModule] = useState<Module>();
  const [deliverables, setDeliverables] = useState<ListDeliverablesElementWithOverdue[]>();
  const [events, setEvents] = useState<ModuleEvent[]>();

  const getModuleResponse = useAppSelector(selectModuleRequest(moduleRequestId));
  const listModuleDeliverablesResponse = useAppSelector(selectDeliverablesSearchRequest(deliverablesRequestId));
  const listModuleEventsResponse = useAppSelector(selectEventList(eventsRequestId));

  const getModule = useCallback(
    (request: GetModuleRequestParam) => {
      const getModule = dispatch(requestGetModule(request));
      const listModuleDeliverables = dispatch(
        requestListDeliverables({
          locale: activeLocale,
          listRequest: {
            moduleId: request.moduleId,
            projectId: request.projectId,
          },
        })
      );
      const listModuleEvents = dispatch(
        requestListEvents({
          moduleId: request.moduleId,
          projectId: request.projectId,
        })
      );
      setModuleRequestId(getModule.requestId);
      setDeliverablesRequestId(listModuleDeliverables.requestId);
      setEventsRequestId(listModuleEvents.requestId);
    },
    [dispatch, setModuleRequestId, setDeliverablesRequestId, setEventsRequestId]
  );

  useEffect(() => {
    if (getModuleResponse && getModuleResponse.status === 'success') {
      setModule(getModuleResponse.data);
    }
  }, [getModuleResponse, setModule]);

  useEffect(() => {
    if (listModuleDeliverablesResponse && listModuleDeliverablesResponse.status === 'success') {
      setDeliverables(listModuleDeliverablesResponse.data);
    }
  }, [listModuleDeliverablesResponse, setDeliverables]);

  useEffect(() => {
    if (listModuleEventsResponse && listModuleEventsResponse.status === 'success') {
      setEvents(listModuleEventsResponse.data);
    }
  }, [listModuleEventsResponse, setDeliverables]);

  return useMemo(
    () => ({
      getModule,
      module,
      deliverables,
      events,
    }),
    [getModule, module, deliverables, events]
  );
};

export default useGetModule;
