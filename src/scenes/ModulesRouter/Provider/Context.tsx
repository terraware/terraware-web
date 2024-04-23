import { createContext, useContext } from 'react';

import { ModuleEvent, ModuleEventSession, ModuleWithNumber } from 'src/types/Module';

export type ModuleData = {
  allSessions: ModuleEventSession[];
  event?: ModuleEvent;
  module?: ModuleWithNumber;
  moduleId: number;
  session?: ModuleEventSession;
  sessionId?: number;
};

// default values pointing to nothing
export const ModuleContext = createContext<ModuleData>({
  allSessions: [],
  moduleId: -1,
});

export const useModuleData = () => useContext(ModuleContext);
