import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

export type Module = components['schemas']['ModulePayload'];

export type ModuleEvent = components['schemas']['ModuleEvent'];
export type ModuleEventWithStartTime = Omit<ModuleEvent, 'startTime'> & { startTime: string };

export type ModuleEventStatus = components['schemas']['ModuleEvent']['status'];
export type ModuleEventType = ModuleEvent['type'];
export type ImportModuleProblemElement = components['schemas']['ImportModuleProblemElement'];
export const MODULE_EVENTS: ModuleEventType[] = ['Live Session', 'One-on-One Session', 'Recorded Session', 'Workshop'];

export const getEventType = (input: ModuleEventType): string => {
  switch (input) {
    case 'Live Session':
      return strings.LIVE_SESSION;
    case 'One-on-One Session':
      return strings.ONE_ON_ONE_SESSION;
    case 'Recorded Session':
      return strings.RECORDED_SESSION;
    case 'Workshop':
      return strings.WORKSHOP;
    default:
      return `${input}`;
  }
};

export type ModuleProjectSearchResult = {
  id: number;
  participant?: {
    cohort?: {
      cohortModules?: {
        module_id: string;
      }[];
    };
  };
};

export type ModuleCohortsAndProjectsSearchResult = {
  cohortModules?: {
    title: string;
    startDate: string;
    endDate: string;
    cohort: {
      id: number;
      name: string;
      participants: {
        id: number;
        name: string;
        projects: {
          id: number;
          name: string;
        }[];
      }[];
    };
  }[];
};

export const getEventStatus = (status: ModuleEventStatus) => {
  switch (status) {
    case 'Not Started': {
      return strings.SESSION_HAS_NOT_STARTED;
    }
    case 'Starting Soon': {
      return strings.SESSION_IS_STARTING_SOON;
    }
    case 'In Progress': {
      return strings.SESSION_IS_IN_PROGRESS;
    }
    case 'Ended': {
      return strings.SESSION_HAS_ENDED;
    }
    default:
      return `${status}`;
  }
};

export type ModuleContentType = keyof Pick<Module, 'additionalResources' | 'preparationMaterials'>;

export type UpdateCohortModuleRequest = components['schemas']['UpdateCohortModuleRequestPayload'];

export type CohortModule = Partial<Module> & { deliverablesQuantity?: number };
