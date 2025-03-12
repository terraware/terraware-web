import { components } from 'src/api/types/generated-schema';

export type ExistingAcceleratorReportConfig = components['schemas']['ExistingAcceleratorReportConfigPayload'];

export type NewAcceleratorReportConfig = components['schemas']['NewAcceleratorReportConfigPayload'];

export type CreateAcceleratorReportConfigRequestPayload =
  components['schemas']['CreateAcceleratorReportConfigRequestPayload'];

export type CreateAcceleratorReportConfigRequest = CreateAcceleratorReportConfigRequestPayload & { projectId: number };

export type ProjectMetric = components['schemas']['ExistingProjectMetricPayload'];

export type StandardMetric = components['schemas']['ExistingStandardMetricPayload'];

export type CreateProjectMetricRequestPayload = components['schemas']['CreateProjectMetricRequestPayload'];

export type UpdateProjectMetricRequestPayload = components['schemas']['UpdateProjectMetricRequestPayload'];

export type CreateProjectMetricRequest = CreateProjectMetricRequestPayload & { projectId: number };

export type UpdateProjectMetricRequest = UpdateProjectMetricRequestPayload & { projectId: number; metricId: number };

export type NewMetric = components['schemas']['NewMetricPayload'];
