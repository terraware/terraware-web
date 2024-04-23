import strings from 'src/strings';

export type ModuleEventType = 'One-on-One Session' | 'Live Session' | 'Workshop';

export type Module = {
  additionalResources?: string;
  endDate: string;
  events: Partial<Record<ModuleEventType, ModuleEvent>>;
  id: number;
  name: string;
  overview?: string;
  preparationMaterials?: string;
  startDate: string;
};

export type ModuleEvent = {
  eventDescription: string;
  sessions: ModuleEventSession[];
};

export type ModuleEventSession = {
  endTime?: string;
  id: number;
  meetingUrl?: string;
  recordingUrl?: string;
  slidesUrl?: string;
  startTime?: string;
};

export const getModuleEventName = (moduleEventType: ModuleEventType) => {
  switch (moduleEventType) {
    case 'Live Session':
      return strings.LIVE_SESSION;
    case 'One-on-One Session':
      return strings.ONE_ON_ONE_SESSION;
    case 'Workshop':
      return strings.WORKSHOP;
    default:
      return '';
  }
};

export const getModuleNumber = (module?: Module, modules?: Module[]): string => {
  const index = (modules || []).findIndex((m) => m.id === module?.id);
  return index === -1 ? '' : (index + 1).toString();
};
