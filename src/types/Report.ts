import { components } from 'src/api/types/generated-schema';

export type Report = components['schemas']['GetReportPayloadV1'];

export type ListReport = components['schemas']['ListReportsResponseElement'];

export type ReportFile = components['schemas']['ListReportFilesResponseElement'];

export type ReportPhoto = components['schemas']['ListReportPhotosResponseElement'];

export type ReportSeedBank = components['schemas']['GetSeedBankV1'];

export type ReportNursery = components['schemas']['GetNurseryV1'];

export type SustainableDevelopmentGoal = components['schemas']['GoalProgressPayloadV1']['goal'];

export const SDG: SustainableDevelopmentGoal[] = [
  'NoPoverty',
  'ZeroHunger',
  'GoodHealth',
  'QualityEducation',
  'GenderEquality',
  'CleanWater',
  'AffordableEnergy',
  'DecentWork',
  'Industry',
  'ReducedInequalities',
  'SustainableCities',
  'ResponsibleConsumption',
  'ClimateAction',
  'LifeBelowWater',
  'LifeOnLand',
  'Peace',
  'Partnerships',
];
