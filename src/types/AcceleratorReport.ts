import { components } from 'src/api/types/generated-schema';

export type ExistingAcceleratorReportConfig = components['schemas']['ExistingAcceleratorReportConfigPayload'];

export type NewAcceleratorReportConfig = components['schemas']['NewAcceleratorReportConfigPayload'];

export type CreateAcceleratorReportConfigRequestPayload =
  components['schemas']['CreateAcceleratorReportConfigRequestPayload'];

export type CreateAcceleratorReportConfigRequest = CreateAcceleratorReportConfigRequestPayload & { projectId: number };

export type ProjectMetric = components['schemas']['ExistingProjectMetricPayload'];
