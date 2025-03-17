import { components } from 'src/api/types/generated-schema';

export type ExistingAcceleratorReportConfig = components['schemas']['ExistingAcceleratorReportConfigPayload'];

export type NewAcceleratorReportConfig = components['schemas']['NewAcceleratorReportConfigPayload'];

export type CreateAcceleratorReportConfigRequestPayload =
  components['schemas']['CreateAcceleratorReportConfigRequestPayload'];

export type CreateAcceleratorReportConfigRequest = CreateAcceleratorReportConfigRequestPayload & { projectId: string };

export type ProjectMetric = components['schemas']['ExistingProjectMetricPayload'];

export type StandardMetric = components['schemas']['ExistingStandardMetricPayload'];

export type CreateProjectMetricRequestPayload = components['schemas']['CreateProjectMetricRequestPayload'];

export type CreateProjectMetricRequest = CreateProjectMetricRequestPayload & { projectId: string };

export type NewMetric = components['schemas']['NewMetricPayload'];

export type AcceleratorReport = components['schemas']['AcceleratorReportPayload'];
