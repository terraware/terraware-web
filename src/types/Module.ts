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
  title: string;
};

export type ModuleEvent = {
  eventTime: string;
  id: number;
  moduleId: number;
  name: string;
};
