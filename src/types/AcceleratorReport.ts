import { PublishedReportPayload } from 'src/queries/generated/publishedReports';
import {
  AcceleratorReportPayload,
  CreateAcceleratorReportConfigRequestPayload,
  ExistingAcceleratorReportConfigPayload,
  NewAcceleratorReportConfigPayload,
  ReportChallengePayload,
  ReportPhotoPayload,
  ReportReviewPayload,
  UpdateAcceleratorReportConfigPayload,
  UpdateAcceleratorReportConfigRequestPayload,
  UpdateAcceleratorReportValuesRequestPayload,
} from 'src/queries/generated/reports';

export type {
  CreateAcceleratorReportConfigRequestPayload,
  ReportReviewPayload,
  UpdateAcceleratorReportConfigPayload,
  UpdateAcceleratorReportConfigRequestPayload,
};

export type UpdateAcceleratorReportRequest = UpdateAcceleratorReportValuesRequestPayload;

export type ExistingAcceleratorReportConfig = ExistingAcceleratorReportConfigPayload;

export type NewAcceleratorReportConfig = NewAcceleratorReportConfigPayload;

export type CreateAcceleratorReportConfigRequest = CreateAcceleratorReportConfigRequestPayload & { projectId: string };

export type UpdateAcceleratorReportConfigRequest = UpdateAcceleratorReportConfigRequestPayload & {
  projectId: string;
};

export type ReviewAcceleratorReportRequest = {
  review: ReportReviewPayload;
  projectId: number;
  reportId: number;
};

export type PublishAcceleratorReportRequest = {
  projectId: number;
  reportId: number;
};

export type AcceleratorReport = AcceleratorReportPayload;

export type AcceleratorReportStatus = AcceleratorReportPayload['status'];
export const AcceleratorReportStatuses: AcceleratorReportStatus[] = [
  'Not Submitted',
  'Submitted',
  'Approved',
  'Needs Update',
  'Not Needed',
];

export type IndicatorType = 'autoCalculated' | 'common' | 'project';

export type ChallengeMitigation = ReportChallengePayload;

export type MetricStatus = 'Achieved' | 'On-Track' | 'Unlikely' | 'Off-Track';

export type PublishedReport = PublishedReportPayload;

export const isAcceleratorReport = (report: any): report is AcceleratorReport => {
  return report && 'id' in report && 'status' in report;
};

export type AcceleratorReportPhoto = ReportPhotoPayload;

export type NewAcceleratorReportPhoto = {
  file: File;
  caption?: string;
};

export const getReportPrefix = (report: AcceleratorReport | PublishedReport): string => {
  const year = report.startDate.split('-')[0];
  return report.quarter ? `${year} ${report.quarter}` : year;
};
