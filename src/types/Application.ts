import { components } from 'src/api/types/generated-schema';

import { Deliverable } from './Deliverables';
import { Module } from './Module';

export type Application = components['schemas']['ApplicationPayload'];
export type ApplicationStatus = Application['status'];
export type ApplicationModule = Omit<
  Module,
  'additionalResources' | 'endDate' | 'events' | 'isActive' | 'startDate' | 'preparationMaterials' | 'title'
>;
export type ApplicationModuleWithDeliverables = ApplicationModule & {
  deliverables: Deliverable[];
  status: 'Incomplete' | 'Complete';
};
