import { createContext, useContext } from 'react';

import { Module, ModuleEvent, ModuleEventSession } from 'src/types/Module';

export type ModuleData = {
  allSessions: ModuleEventSession[];
  event?: ModuleEvent;
  module?: Module;
  moduleId: number;
  projectId: number;
  session?: ModuleEventSession;
  sessionId?: number;
};

// default values pointing to nothing
export const ModuleContext = createContext<ModuleData>({
  allSessions: [],
  moduleId: -1,
  projectId: -1,
});

export const useModuleData = () => useContext(ModuleContext);
