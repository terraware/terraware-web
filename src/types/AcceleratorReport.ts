import { components } from 'src/api/types/generated-schema';

export type UpdateAcceleratorReportRequest = components['schemas']['UpdateAcceleratorReportValuesRequestPayload'];

export type ExistingAcceleratorReportConfig = components['schemas']['ExistingAcceleratorReportConfigPayload'];

export type NewAcceleratorReportConfig = components['schemas']['NewAcceleratorReportConfigPayload'];

export type CreateAcceleratorReportConfigRequestPayload =
  components['schemas']['CreateAcceleratorReportConfigRequestPayload'];

export type UpdateAcceleratorReportConfigRequestPayload =
  components['schemas']['UpdateAcceleratorReportConfigRequestPayload'];

export type UpdateAcceleratorReportConfigPayload = components['schemas']['UpdateAcceleratorReportConfigPayload'];

export type CreateAcceleratorReportConfigRequest = CreateAcceleratorReportConfigRequestPayload & { projectId: string };

export type UpdateAcceleratorReportConfigRequest = UpdateAcceleratorReportConfigRequestPayload & {
  projectId: string;
};

export type ReportReviewPayload = components['schemas']['ReportReviewPayload'];

export type ReviewAcceleratorReportRequest = {
  review: ReportReviewPayload;
  projectId: number;
  reportId: number;
};

export type PublishAcceleratorReportRequest = {
  projectId: number;
  reportId: number;
};

export type AcceleratorReport = components['schemas']['AcceleratorReportPayload'];

export type AcceleratorReportStatus = components['schemas']['AcceleratorReportPayload']['status'];
export const AcceleratorReportStatuses: AcceleratorReportStatus[] = [
  'Not Submitted',
  'Submitted',
  'Approved',
  'Needs Update',
  'Not Needed',
];

export type IndicatorType = 'autoCalculated' | 'common' | 'project';

export type ChallengeMitigation = components['schemas']['ReportChallengePayload'];

export type MetricStatus = 'Achieved' | 'On-Track' | 'Unlikely' | 'Off-Track';

export type PublishedReport = components['schemas']['PublishedReportPayload'];

export const isAcceleratorReport = (report: any): report is AcceleratorReport => {
  return report && 'id' in report && 'status' in report;
};

export type AcceleratorReportPhoto = components['schemas']['ReportPhotoPayload'];

export type NewAcceleratorReportPhoto = {
  file: File;
  caption?: string;
};

export const getReportPrefix = (report: AcceleratorReport | PublishedReport): string => {
  const year = report.startDate.split('-')[0];
  return report.quarter ? `${year} ${report.quarter}` : year;
};
