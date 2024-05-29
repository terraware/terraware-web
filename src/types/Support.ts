import { components } from 'src/api/types/generated-schema';
import { Statuses } from 'src/redux/features/asyncUtils';

export type ServiceRequestType = components['schemas']['ServiceRequestType'];

export type SupportRequest = components['schemas']['SubmitSupportRequestPayload'];

export type TemporaryAttachment = components['schemas']['TemporaryAttachment'];

export type AttachmentRequest = {
  filename: string;
  requestId: string;
  status?: Statuses;
  temporaryAttachmentId?: string;
};
