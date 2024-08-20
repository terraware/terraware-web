import { DateTime } from 'luxon';

import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

import { DeliverableCategoryType, DeliverableStatusType, DeliverableTypeType } from './Deliverables';

export type Module = components['schemas']['ProjectModule'];

export type ModuleEvent = components['schemas']['ProjectModuleEvent'];

export type ModuleEventSession = components['schemas']['ProjectModuleEventSession'];

export type ModuleEventSessionStatus = components['schemas']['ProjectModuleEventSession']['status'];

export type ModuleEventType = ModuleEventSession['type'];
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

export const getEventStatus = (status: ModuleEventSessionStatus) => {
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
