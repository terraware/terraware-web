import { components } from 'src/api/types/generated-schema';

export type Application = components['schemas']['ApplicationPayload'];
export type ApplicationStatus = Application['status'];
export type ApplicationModule = components['schemas']['ApplicationModulePayload'];
export type ApplicationDeliverable = components['schemas']['ApplicationDeliverablePayload'];
