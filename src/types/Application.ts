import { components } from 'src/api/types/generated-schema';

import { Deliverable, DeliverableCategoryType, DeliverableStatusType, DeliverableTypeType } from './Deliverables';
import { Module } from './Module';

export type Application = components['schemas']['ApplicationPayload'];
export type ApplicationStatus = Application['status'];
export type ApplicationModule = components['schemas']['ApplicationModulePayload'];
export type ApplicationDeliverable = components['schemas']['ApplicationDeliverablePayload'];

export type ApplicationModuleWithDeliverables = ApplicationModule & {
  deliverables: ApplicationDeliverable[];
};
