import { components } from 'src/api/types/generated-schema';

export type ExistingAcceleratorReportConfig = components['schemas']['ExistingAcceleratorReportConfigPayload'];

export type NewAcceleratorReportConfig = components['schemas']['NewAcceleratorReportConfigPayload'];

export type CreateAcceleratorReportConfigRequestPayload =
  components['schemas']['CreateAcceleratorReportConfigRequestPayload'];

export type UpdateAcceleratorReportConfigRequestPayload =
  components['schemas']['UpdateAcceleratorReportConfigRequestPayload'];

export type CreateAcceleratorReportConfigRequest = CreateAcceleratorReportConfigRequestPayload & { projectId: string };

export type UpdateAcceleratorReportConfigRequest = UpdateAcceleratorReportConfigRequestPayload & {
  projectId: string;
  configId: number;
};

export type ProjectMetric = components['schemas']['ExistingProjectMetricPayload'];

export type StandardMetric = components['schemas']['ExistingStandardMetricPayload'];

export type CreateProjectMetricRequestPayload = components['schemas']['CreateProjectMetricRequestPayload'];

export type UpdateProjectMetricRequestPayload = components['schemas']['UpdateProjectMetricRequestPayload'];

export type CreateProjectMetricRequest = CreateProjectMetricRequestPayload & { projectId: string };

export type UpdateProjectMetricRequest = UpdateProjectMetricRequestPayload & { projectId: number; metricId: number };

export type UpdateAcceleratorReportMetricsRequestPayload =
  components['schemas']['UpdateAcceleratorReportMetricsRequestPayload'];

export type UpdateAcceleratorReportMetricsRequest = UpdateAcceleratorReportMetricsRequestPayload & {
  projectId: number;
  reportId: number;
};

export type NewMetric = components['schemas']['NewMetricPayload'];

export type AcceleratorReport = components['schemas']['AcceleratorReportPayload'];

export type SystemMetricName = 'Mortality Rate' | 'Seedlings' | 'Seeds Collected' | 'Trees Planted' | 'Species Planted';
