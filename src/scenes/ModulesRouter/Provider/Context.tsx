import { createContext, useContext } from 'react';

import { Module, ModuleDeliverable, ModuleEvent, ModuleEventSession } from 'src/types/Module';

export type ModuleData = {
  allSessions: ModuleEventSession[];
  deliverables: ModuleDeliverable[];
  event?: ModuleEvent;
  module?: Module;
  moduleId: number;
  session?: ModuleEventSession;
  sessionId?: number;
};

// default values pointing to nothing
export const ModuleContext = createContext<ModuleData>({
  allSessions: [],
  deliverables: [],
  moduleId: -1,
});

export const useModuleData = () => useContext(ModuleContext);
