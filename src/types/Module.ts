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
