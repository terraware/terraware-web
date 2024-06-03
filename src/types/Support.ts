import { components } from 'src/api/types/generated-schema';
import { IconName } from 'src/components/common/icon/icons';
import { Statuses } from 'src/redux/features/asyncUtils';
import strings from 'src/strings';

export type SupportRequestType = components['schemas']['SubmitSupportRequestPayload']['requestType'];

export type SupportRequest = components['schemas']['SubmitSupportRequestPayload'];

export type TemporaryAttachment = components['schemas']['TemporaryAttachment'];

export type AttachmentRequest = {
  filename: string;
  requestId: string;
  status?: Statuses;
  temporaryAttachmentId?: string;
};

export const getSupportRequestName = (type: SupportRequestType): string => {
  switch (type) {
    case 'Bug Report':
      return strings.BUG_REPORT;
    case 'Feature Request':
      return strings.FEATURE_REQUEST;
    case 'Contact Us':
      return strings.CONTACT_US;
  }
};

export const getSupportRequestDescription = (type: SupportRequestType): string => {
  switch (type) {
    case 'Bug Report':
      return strings.BUG_REPORT_DESCRIPTION;
    case 'Feature Request':
      return strings.FEATURE_REQUEST_DESCRIPTION;
    case 'Contact Us':
      return strings.CONTACT_US_DESCRIPTION;
  }
};

export const getSupportRequestInstructions = (type: SupportRequestType): string => {
  switch (type) {
    case 'Bug Report':
      return strings.BUG_REPORT_INSTRUCTIONS;
    case 'Feature Request':
      return strings.FEATURE_REQUEST_INSTRUCTIONS;
    case 'Contact Us':
      return strings.CONTACT_US_INSTRUCTIONS;
  }
};

export const getSupportRequestSubpath = (type: SupportRequestType): string => {
  switch (type) {
    case 'Bug Report':
      return 'bug-report';
    case 'Feature Request':
      return 'feature-request';
    case 'Contact Us':
      return 'contact-us';
  }
};

export const getSupportRequestIconName = (type: SupportRequestType): IconName => {
  switch (type) {
    case 'Bug Report':
      return 'bug';
    case 'Feature Request':
      return 'sparkles';
    case 'Contact Us':
      return 'mail';
  }
};
