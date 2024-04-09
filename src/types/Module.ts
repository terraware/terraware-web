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
  additionalLinks?: { label: string }[];
  description?: string;
  eventTime: string;
  id: number;
  links?: { label: string }[];
  moduleId: number;
  name: string;
};
