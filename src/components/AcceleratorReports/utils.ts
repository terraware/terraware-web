import {
  AcceleratorReportPayload,
  ReportCommonIndicatorPayload,
  ReportReviewPayload,
  ReviewAcceleratorReportIndicatorsRequestPayload,
  UpdateAcceleratorReportValuesRequestPayload,
} from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload } from 'src/queries/generated/publishedReports';
import { ILocalizedStrings } from 'src/strings';
import { AcceleratorReportStatus, IndicatorType, MetricStatus } from 'src/types/AcceleratorReport';

export const getReportName = (report: AcceleratorReportPayload | PublishedReportPayload) => {
  const year = report.startDate?.split('-')[0];
  return report.quarter ? `${year}-${report.quarter}` : year;
};

export type IndicatorClass = ReportCommonIndicatorPayload['classId'];
export type IndicatorCategory = ReportCommonIndicatorPayload['category'];
export type IndicatorLevel = ReportCommonIndicatorPayload['level'];

export type ProgressIndicator = {
  baseline?: number;
  category?: IndicatorCategory;
  isPublishable?: boolean;
  id?: number;
  level?: IndicatorLevel;
  overrideValue?: number;
  systemValue?: number;
  type?: IndicatorType;
  classId: IndicatorClass;
  endOfProjectTarget?: number;
  description?: string;
  currentYearProgress?: { quarter: string; value: number }[];
  name: string;
  precision?: number;
  previousYearCumulativeTotal?: number;
  progressNotes?: string;
  projectsComments?: string;
  refId: string;
  status?: MetricStatus;
  supportingDocumentUrl?: string;
  target?: number;
  unit?: string;
  value?: number;
};

// Reference ids read like 11.2.3, so compare them segment by segment as numbers rather than as text,
// which would order 11.10 before 11.2.
export const compareRefIds = (a: string, b: string) => {
  const aSegments = a.split('.');
  const bSegments = b.split('.');

  for (let index = 0; index < Math.max(aSegments.length, bSegments.length); index++) {
    const difference = (Number(aSegments[index]) || 0) - (Number(bSegments[index]) || 0);

    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
};

// the v2 views read indicators in reference id order, so every list of them arrives that way
const sortedByRefId = (indicators: ProgressIndicator[]): ProgressIndicator[] =>
  [...indicators].sort((a, b) => compareRefIds(a.refId, b.refId));

export const getProgressIndicators = (report?: AcceleratorReportPayload): ProgressIndicator[] =>
  sortedByRefId([
    ...(report?.commonIndicators ?? []).map((indicator) => ({ ...indicator, type: 'common' as const })),
    ...(report?.projectIndicators ?? []).map((indicator) => ({ ...indicator, type: 'project' as const })),
    ...(report?.autoCalculatedIndicators ?? []).map((indicator) => ({
      ...indicator,
      name: indicator.indicator,
      type: 'autoCalculated' as const,
      value: indicator.overrideValue ?? indicator.systemValue,
    })),
  ]);

export const getFunderVisibleIndicators = (report?: AcceleratorReportPayload): ProgressIndicator[] =>
  getProgressIndicators(report).filter((indicator) => indicator.isPublishable);

export const getPublishedProgressIndicators = (report?: PublishedReportPayload): ProgressIndicator[] =>
  sortedByRefId([
    ...(report?.autoCalculatedIndicators ?? []).map((indicator) => ({ ...indicator, type: 'autoCalculated' as const })),
    ...(report?.commonIndicators ?? []).map((indicator) => ({ ...indicator, type: 'common' as const })),
    ...(report?.projectIndicators ?? []).map((indicator) => ({ ...indicator, type: 'project' as const })),
  ]);

/**
 * The headline number for an indicator: for a cumulative class, the quarters of the year on top of
 * whatever the indicator started the year at; otherwise the quarter's own value.
 *
 * `currentYearProgress` can be passed separately so an editor can substitute the value being typed
 * for the quarter being reported on.
 */
export const getIndicatorCumulativeValue = (
  indicator: ProgressIndicator,
  currentYearProgress: { quarter: string; value: number }[] = indicator.currentYearProgress ?? []
): number | undefined => {
  // both cumulative classes accumulate the year's quarters; only the lifetime one reaches back past
  // the start of the year
  const isLifetime = indicator.classId === 'Lifetime Cumulative';
  const isYearly = indicator.classId === 'Yearly Cumulative';

  if (!isLifetime && !isYearly) {
    return indicator.value;
  }

  // with no quarterly breakdown a yearly indicator has nothing to accumulate, and its zero starting
  // total would otherwise report no progress at all
  if (isYearly && currentYearProgress.length === 0) {
    return indicator.value;
  }

  // a yearly indicator restarts at zero each year, so it carries neither the baseline nor a prior total
  const startingTotal = isLifetime ? indicator.previousYearCumulativeTotal ?? indicator.baseline ?? 0 : 0;

  return currentYearProgress.reduce((total, progress) => total + progress.value, startingTotal);
};

/** The report sections named by `unpublishedProperties`, as a readable list. */
export const unpublishedPropertyList = (unpublishedProperties: string[], strings: ILocalizedStrings): string => {
  const propertyLabels: Record<string, string> = {
    achievements: strings.ACHIEVEMENTS,
    additionalComments: strings.ADDITIONAL_COMMENTS,
    autoCalculatedIndicators: strings.AUTO_CALCULATED_INDICATORS,
    challenges: strings.CHALLENGES,
    commonIndicators: strings.COMMON_INDICATORS,
    financialSummaries: strings.FINANCIAL_SUMMARIES,
    highlights: strings.HIGHLIGHTS,
    photos: strings.PHOTOS,
    projectIndicators: strings.PROJECT_INDICATORS,
  };

  return unpublishedProperties.map((property) => propertyLabels[property] ?? property).join(', ');
};

export const acceleratorReportStatusLabel = (
  status: AcceleratorReportStatus | undefined,
  strings: ILocalizedStrings,
  isConsoleView?: boolean
): string => {
  switch (status) {
    case 'Approved':
      return strings.APPROVED;
    case 'Needs Update':
      return isConsoleView ? strings.UPDATE_REQUESTED : strings.UPDATE_NEEDED;
    case 'Not Needed':
      return strings.NOT_NEEDED;
    case 'Not Submitted':
      return strings.NOT_SUBMITTED;
    case 'Submitted':
      return strings.SUBMITTED;
    default:
      return '';
  }
};

export const metricStatusLabel = (status: MetricStatus | undefined, strings: ILocalizedStrings): string => {
  switch (status) {
    case 'Achieved':
      return strings.ACHIEVED;
    case 'Off-Track':
      return strings.OFF_TRACK;
    case 'On-Track':
      return strings.ON_TRACK;
    case 'Unlikely':
      return strings.UNLIKELY;
    default:
      return '';
  }
};

export const indicatorCategoryLabel = (category: IndicatorCategory | undefined, strings: ILocalizedStrings): string => {
  switch (category) {
    case 'Biodiversity':
      return strings.BIODIVERSITY;
    case 'Climate':
      return strings.CLIMATE;
    case 'Community':
      return strings.COMMUNITY;
    case 'Project Objectives':
      return strings.PROJECT_OBJECTIVES;
    default:
      return '';
  }
};

export const indicatorLevelLabel = (level: IndicatorLevel | undefined, strings: ILocalizedStrings): string => {
  switch (level) {
    case 'Goal':
      return strings.INDICATOR_TYPE_GOAL;
    case 'Outcome':
      return strings.METRIC_TYPE_OUTCOME;
    case 'Output':
      return strings.METRIC_TYPE_OUTPUT;
    case 'Process':
      return strings.INDICATOR_TYPE_PROCESS;
    default:
      return '';
  }
};

export const indicatorClassLabel = (classId: IndicatorClass | undefined, strings: ILocalizedStrings): string => {
  switch (classId) {
    case 'Lifetime Cumulative':
      return strings.LIFETIME_CUMULATIVE;
    case 'Yearly Cumulative':
      return strings.YEARLY_CUMULATIVE;
    case 'Not Cumulative':
      return strings.NOT_CUMULATIVE;
    default:
      return '';
  }
};

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
