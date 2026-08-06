import {
  ReportReviewPayload,
  ReviewAcceleratorReportIndicatorsRequestPayload,
} from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';
import { AcceleratorReportPayload, UpdateAcceleratorReportValuesRequestPayload } from 'src/queries/generated/reports';
import { MetricStatus } from 'src/types/AcceleratorReport';

export const getReportName = (report: AcceleratorReportPayload | PublishedReportPayload) => {
  const year = report.startDate?.split('-')[0];
  return report.quarter ? `${year}-${report.quarter}` : year;
};

// the editor keeps a blank row so a fresh list is typeable; it should not be saved
const savedAchievements = (report: AcceleratorReportPayload) =>
  report.achievements.map((achievement) => achievement.trim()).filter((achievement) => achievement);

const savedChallenges = (report: AcceleratorReportPayload) =>
  report.challenges
    .map((challenge) => ({
      challenge: challenge.challenge.trim(),
      mitigationPlan: challenge.mitigationPlan.trim(),
    }))
    .filter((challenge) => challenge.challenge || challenge.mitigationPlan);

export const toIndicatorEntriesPayload = (
  report: AcceleratorReportPayload
): ReviewAcceleratorReportIndicatorsRequestPayload => {
  const entries = (indicator: {
    progressNotes?: string;
    projectsComments?: string;
    status?: MetricStatus;
    supportingDocumentUrl?: string;
  }) => ({
    progressNotes: indicator.progressNotes,
    projectsComments: indicator.projectsComments,
    status: indicator.status,
    supportingDocumentUrl: indicator.supportingDocumentUrl,
  });

  return {
    autoCalculatedIndicators: report.autoCalculatedIndicators.map((indicator) => ({
      ...entries(indicator),
      indicator: indicator.indicator,
      overrideValue: indicator.overrideValue,
    })),
    commonIndicators: report.commonIndicators.map((indicator) => ({
      ...entries(indicator),
      id: indicator.id,
      value: indicator.value,
    })),
    projectIndicators: report.projectIndicators.map((indicator) => ({
      ...entries(indicator),
      id: indicator.id,
      value: indicator.value,
    })),
  };
};

export const toUpdateReportValuesPayload = (
  report: AcceleratorReportPayload
): UpdateAcceleratorReportValuesRequestPayload => ({
  achievements: savedAchievements(report),
  additionalComments: report.additionalComments,
  challenges: savedChallenges(report),
  financialSummaries: report.financialSummaries,
  highlights: report.highlights,
  ...toIndicatorEntriesPayload(report),
});

export const toReportReviewPayload = (report: AcceleratorReportPayload): ReportReviewPayload => ({
  achievements: savedAchievements(report),
  additionalComments: report.additionalComments,
  challenges: savedChallenges(report),
  feedback: report.feedback,
  financialSummaries: report.financialSummaries,
  highlights: report.highlights,
  internalComment: report.internalComment,
  status: report.status,
});
