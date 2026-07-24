import {
  GetNurseryV1,
  GetPlantingSiteV1,
  GetReportPayloadV1,
  GetReportSettingsResponsePayload,
  GetSeedBankV1,
  GoalProgressPayloadV1,
  ListReportFilesResponseElement,
  ListReportPhotosResponseElement,
  ListReportsResponseElement,
} from 'src/queries/generated/seedFundReports';
import strings from 'src/strings';

export type SeedFundReport = GetReportPayloadV1;

export type SeedFundReportListElement = ListReportsResponseElement;

export type SeedFundReportFile = ListReportFilesResponseElement;

export type SeedFundReportPhoto = ListReportPhotosResponseElement;

export type SeedFundReportSeedBank = GetSeedBankV1;

export type SeedFundReportNursery = GetNurseryV1;

export type SeedFundReportPlantingSite = GetPlantingSiteV1;

export type SustainableDevelopmentGoal = GoalProgressPayloadV1['goal'];

export type SeedFundReportsSettings = Omit<GetReportSettingsResponsePayload, 'status'>;

export type SeedFundReportStatus = 'New' | 'In Progress' | 'Locked' | 'Submitted';

export function seedFundReportStatusName(status: SeedFundReportStatus): string {
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
