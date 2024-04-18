export type Module = {
  dateRange: string;
  description: string;
  id: number;
  name: string;
  title: string;
  contents: ModuleContent[];
  events: ModuleEvent[];
};

export type ModuleContent = {
  content: string;
  dueDate: string | null;
  id: number;
  moduleId: number;
  url: string;
  title: string;
};

export type ModuleEvent = {
  callDescription?: string;
  description?: string;
  endTime: string;
  id: number;
  meetingURL?: string;
  moduleId: number;
  name: string;
  recordingURL?: string;
  slidesURL?: string;
  startTime: string;
};
