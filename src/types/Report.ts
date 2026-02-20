import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

export type Report = components['schemas']['GetReportPayloadV1'];

export type ListReport = components['schemas']['ListReportsResponseElement'];

export type ReportFile = components['schemas']['ListReportFilesResponseElement'];

export type ReportPhoto = components['schemas']['ListReportPhotosResponseElement'];

export type ReportSeedBank = components['schemas']['GetSeedBankV1'];

export type ReportNursery = components['schemas']['GetNurseryV1'];

export type ReportPlantingSite = components['schemas']['GetPlantingSiteV1'];

export type SustainableDevelopmentGoal = components['schemas']['GoalProgressPayloadV1']['goal'];

export type ReportStatus = 'New' | 'In Progress' | 'Locked' | 'Submitted';

export function statusName(status: ReportStatus): string {
  switch (status) {
    case 'New':
      return strings.NEW;
    case 'In Progress':
      return strings.IN_PROGRESS;
    case 'Locked':
      return strings.LOCKED;
    case 'Submitted':
      return strings.SUBMITTED;
  }
}
