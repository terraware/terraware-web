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

export type ProjectMetric = components['schemas']['ExistingProjectMetricPayload'];

export type StandardMetric = components['schemas']['ExistingStandardMetricPayload'];

export type SystemMetric = components['schemas']['SystemMetricPayload'];

export type ReportProjectMetric = components['schemas']['ReportProjectMetricPayload'];

export type ReportStandardMetric = components['schemas']['ReportStandardMetricPayload'];

export type ReportSystemMetric = components['schemas']['ReportSystemMetricPayload'];

export type ReportProjectMetricEntries = components['schemas']['ReportProjectMetricEntriesPayload'];

export type ReportStandardMetricEntries = components['schemas']['ReportStandardMetricEntriesPayload'];

export type ReportSystemMetricEntries = components['schemas']['ReportSystemMetricEntriesPayload'];

export type CreateProjectMetricRequestPayload = components['schemas']['CreateProjectMetricRequestPayload'];

export type UpdateProjectMetricRequestPayload = components['schemas']['UpdateProjectMetricRequestPayload'];

export type CreateProjectMetricRequest = CreateProjectMetricRequestPayload & { projectId: string };

export type UpdateProjectMetricRequest = UpdateProjectMetricRequestPayload & { projectId: number; metricId: number };

export type CreateStandardMetricRequestPayload = components['schemas']['CreateStandardMetricRequestPayload'];

export type UpdateStandardMetricRequestPayload = components['schemas']['UpdateStandardMetricRequestPayload'];

export type ReviewAcceleratorReportMetricsRequestPayload =
  components['schemas']['ReviewAcceleratorReportMetricsRequestPayload'];

export type ReviewAcceleratorReportMetricsRequest = ReviewAcceleratorReportMetricsRequestPayload & {
  reportId: number;
};

export type ReviewManyAcceleratorReportMetricsRequest = {
  requests: ReviewAcceleratorReportMetricsRequest[];
  projectId: number;
};

export type ReviewAcceleratorReportMetricRequest = {
  metric: ReviewAcceleratorReportMetricsRequestPayload;
  projectId: number;
  reportId: number;
};

export type RefreshAcceleratorReportSystemMetricsRequest = {
  projectId: number;
  reportId: number;
  metricName: SystemMetricName;
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

export type NewMetric = components['schemas']['NewMetricPayload'];

export type AcceleratorReport = components['schemas']['AcceleratorReportPayload'];

export type SystemMetricName = ReportSystemMetric['metric'];

export type AcceleratorReportStatus = components['schemas']['AcceleratorReportPayload']['status'];
export const AcceleratorReportStatuses: AcceleratorReportStatus[] = [
  'Not Submitted',
  'Submitted',
  'Approved',
  'Needs Update',
  'Not Needed',
];

export type AcceleratorReportMetricStatus = (ReportProjectMetric | ReportStandardMetric | ReportSystemMetric)['status'];

export const AcceleratorMetricStatuses: AcceleratorReportMetricStatus[] = ['Achieved', 'On-Track', 'Unlikely'];

export type MetricType = 'project' | 'standard' | 'system';

export type ChallengeMitigation = components['schemas']['ReportChallengePayload'];

export type MetricStatus = 'Achieved' | 'On-Track' | 'Unlikely';

export type PublishedReport = components['schemas']['PublishedReportPayload'];
export type PublishedReportMetric = components['schemas']['PublishedReportMetricPayload'];

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
  return report.frequency === 'Annual' ? year : report.quarter ? `${year} ${report.quarter}` : '';
};
