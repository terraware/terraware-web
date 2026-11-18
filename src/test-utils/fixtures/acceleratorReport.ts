import { AcceleratorReportPayload, ReportProjectIndicatorPayload } from 'src/queries/generated/acceleratorReports';

export const buildAcceleratorReport = (
  overrides: Partial<AcceleratorReportPayload> = {}
): AcceleratorReportPayload => ({
  achievements: [],
  autoCalculatedIndicators: [],
  challenges: [],
  commonIndicators: [],
  endDate: '2026-03-31',
  id: 1,
  modifiedBy: 1,
  modifiedByUser: { fullName: 'Test User', userId: 1 },
  modifiedTime: '2026-04-01T00:00:00Z',
  photos: [],
  projectId: 1,
  projectIndicators: [],
  quarter: 'Q1',
  startDate: '2026-01-01',
  status: 'Not Submitted',
  unpublishedProperties: [],
  ...overrides,
});

export const buildReportIndicator = (
  overrides: Partial<ReportProjectIndicatorPayload> = {}
): ReportProjectIndicatorPayload => ({
  category: 'Project Objectives',
  classId: 'Not Cumulative',
  id: 1,
  isPublishable: true,
  level: 'Output',
  name: 'Hectares under restoration',
  precision: 0,
  refId: '1.1',
  target: 100,
  ...overrides,
});
