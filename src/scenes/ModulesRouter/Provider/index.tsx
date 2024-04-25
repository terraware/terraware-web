import React, { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';

import { requestGetModule } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleRequest } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ModuleEvent, ModuleEventSession, ModuleWithNumber } from 'src/types/Module';
import useSnackbar from 'src/utils/useSnackbar';

import { ModuleContext, ModuleData } from './Context';

export type Props = {
  children?: React.ReactNode;
};

const ModuleProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const pathParams = useParams<{ sessionId: string; moduleId: string; projectId: string }>();

  const moduleId = Number(pathParams.moduleId);
  const projectId = Number(pathParams.projectId);
  const sessionId = Number(pathParams.sessionId);

  const [allSessions, setAllSessions] = useState<ModuleEventSession[]>([]);
  const [event, setEvent] = useState<ModuleEvent>();
  const [module, setModule] = useState<ModuleWithNumber>();
  const [session, setSession] = useState<ModuleEventSession>();

  const [requestId, setRequestId] = useState('');
  const moduleRequest = useAppSelector(selectModuleRequest(requestId));

  const [moduleData, setModuleData] = useState<ModuleData>({
    allSessions,
    event,
    module,
    moduleId,
    session,
    sessionId,
  });

  useEffect(() => {
    if (!isNaN(projectId) && !isNaN(moduleId)) {
      const request = dispatch(requestGetModule({ projectId, moduleId }));
      setRequestId(request.requestId);
    }
  }, [dispatch, projectId, moduleId]);

  useEffect(() => {
    if (!moduleRequest) {
      return;
    }

    if (moduleRequest.status === 'success' && moduleRequest.data) {
      setModule(moduleRequest.data);
    } else if (moduleRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [moduleRequest, snackbar]);

  useEffect(() => {
    // Need to find the event and event type based on the session ID, if it exists
    if (isNaN(sessionId) || !module?.events) {
      return;
    }

    const eventWithSession = module.events
      .filter((event: ModuleEvent) => !!event.sessions.find((session) => session.id === sessionId))
      .map((event: ModuleEvent) => ({
        event: event,
        session: event.sessions.find((session) => session.id === sessionId),
      }))
      .shift();

    setEvent(eventWithSession?.event);
    setSession(eventWithSession?.session);
  }, [module, sessionId]);

  useEffect(() => {
    if (!module?.events) {
      return;
    }

    setAllSessions(module.events.map((event: ModuleEvent) => event.sessions || []).flat());
  }, [module]);

  useEffect(() => {
    setModuleData({
      allSessions,
      event,
      session,
      sessionId,
      module,
      moduleId,
    });
  }, [allSessions, event, session, sessionId, module, moduleId]);

  return (
    <ModuleContext.Provider value={moduleData}>
      {children}
      <Outlet />
    </ModuleContext.Provider>
  );
};

export default ModuleProvider;
