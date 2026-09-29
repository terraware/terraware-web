import { components } from 'src/api/types/generated-schema';
import { ModuleDeliverablePayload, ModulePayload } from 'src/queries/generated/modules';
import { ProjectModulePayload } from 'src/queries/generated/projectModules';
import strings from 'src/strings';

export type ProjectModule = ProjectModulePayload;
export type Module = ModulePayload;

export type ModuleDeliverable = ModuleDeliverablePayload;

export type ModuleEvent = components['schemas']['ModuleEvent'];
export type ModuleEventPartial = Omit<Partial<components['schemas']['ModuleEvent']>, 'projects'> & {
  projects?: ModuleEventProject[];
  feId?: symbol;
};
export type ModuleEventProject = Partial<NonNullable<components['schemas']['ModuleEvent']['projects']>[0]>;
export type ModuleEventWithStartTime = Omit<ModuleEvent, 'startTime'> & { startTime: string };

export type ModuleEventStatus = components['schemas']['ModuleEvent']['status'];
export type ModuleEventType = ModuleEvent['type'];

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
      return `${input as string}`;
  }
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
      return `${status as string}`;
  }
};

export type ModuleContentType = keyof Pick<Module, 'additionalResources' | 'preparationMaterials'>;
