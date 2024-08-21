import { createContext, useContext } from 'react';

import { ListDeliverablesElement } from 'src/types/Deliverables';
import { Module, ModuleEvent, ModuleEventSession } from 'src/types/Module';

export type ModuleData = {
  allSessions: ModuleEventSession[];
  deliverables: ListDeliverablesElement[];
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
