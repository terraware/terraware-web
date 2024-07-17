import { components } from 'src/api/types/generated-schema';

import { Deliverable, DeliverableCategoryType, DeliverableStatusType, DeliverableTypeType } from './Deliverables';
import { Module } from './Module';

export type Application = components['schemas']['ApplicationPayload'];
export type ApplicationDeliverable = {
  id: number;
  name: string;
  type: DeliverableTypeType;
  category: DeliverableCategoryType;
  status: DeliverableStatusType;
};
export type ApplicationStatus = Application['status'];
export type ApplicationModule = Omit<
  Module,
  'additionalResources' | 'endDate' | 'events' | 'isActive' | 'startDate' | 'preparationMaterials' | 'title'
>;
export type ApplicationModuleWithDeliverables = ApplicationModule & {
  category: 'Pre-screen' | 'Application';
  deliverables: ApplicationDeliverable[];
  status: 'Incomplete' | 'Complete';
};
