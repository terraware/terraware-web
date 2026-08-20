import { useCallback, useMemo } from 'react';

import { ColumnHeader } from 'export-to-csv';

import {
  IndicatorCategory,
  IndicatorClass,
  IndicatorLevel,
  ProgressIndicator,
  acceleratorReportStatusLabel,
  compareRefIds,
  getIndicatorCumulativeValue,
  getProgressIndicators,
  getPublishedProgressIndicators,
  getReportName,
  indicatorCategoryLabel,
  indicatorClassLabel,
  indicatorLevelLabel,
  metricStatusLabel,
  unpublishedPropertyList,
} from 'src/components/AcceleratorReports/utils';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import {
  AcceleratorReportPayload,
  useLazyGetOneAcceleratorReportQuery,
} from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload, useLazyListPublishedReportsQuery } from 'src/queries/generated/publishedReports';
import { AcceleratorReportStatus, IndicatorType, MetricStatus, isAcceleratorReport } from 'src/types/AcceleratorReport';
import { CsvData, makeCsv } from 'src/utils/csv';
import { getMediumDate } from 'src/utils/dateFormatter';
import downloadZipFile from 'src/utils/downloadZipFile';
import { roundToDecimal } from 'src/utils/numbers';
import useSnackbar from 'src/utils/useSnackbar';

/**
 * Who the export is for, which is what decides the columns. Views do not pass this: it follows from
 * which `useExportReportCsv` callback they use, and for a working report from the route they sit on.
 */
export type ReportCsvAudience = 'funder' | 'participant' | 'console';

export type ReportCsvParams = {
  audience: ReportCsvAudience;
  /** exactly the indicators the view is showing, so the export cannot include more than the reader sees */
  indicators: ProgressIndicator[];
  projectName?: string;
  report: AcceleratorReportPayload | PublishedReportPayload;
};

/**
 * A cell that cannot be written until the reader's language is known. Row building stays free of the
 * string table by naming what a cell holds and leaving the hook to render it.
 */
export type LocalizedCsvValue =
  | { kind: 'boolean'; value?: boolean }
  | { kind: 'date'; value: string }
  | { kind: 'indicatorCategory'; value?: IndicatorCategory }
  | { kind: 'indicatorClass'; value?: IndicatorClass }
  | { kind: 'indicatorLevel'; value?: IndicatorLevel }
  | { kind: 'indicatorType'; value?: IndicatorType }
  | { kind: 'metricStatus'; value?: MetricStatus }
  | { kind: 'reportSections'; value: string[] }
  | { kind: 'reportStatus'; isConsoleView: boolean; value?: AcceleratorReportStatus };

export type ReportCsvValue = string | number | undefined | LocalizedCsvValue;

export const isLocalizedCsvValue = (value: ReportCsvValue): value is LocalizedCsvValue =>
  typeof value === 'object' && value !== null && 'kind' in value;

export type ReportCsvField =
  | 'additionalComments'
  | 'endDate'
  | 'feedback'
  | 'financialSummaries'
  | 'highlights'
  | 'internalComment'
  | 'project'
  | 'report'
  | 'startDate'
  | 'status'
  | 'unpublishedChanges';

export type ReportCsvRow = { field: ReportCsvField; value: ReportCsvValue };

/**
 * The report as a single-record sheet, so its long-form narrative fields stay readable in a
 * spreadsheet. Fields the audience cannot see on screen are left out entirely.
 */
export const makeReportCsvRows = ({ audience, projectName, report }: ReportCsvParams): ReportCsvRow[] => {
  const acceleratorReport = isAcceleratorReport(report) ? report : undefined;
  // the funder-facing views never show the working report's review state, even when rendering one
  const reviewFields = audience !== 'funder' ? acceleratorReport : undefined;

  return [
    ...(projectName ? [{ field: 'project' as const, value: projectName }] : []),
    { field: 'report' as const, value: getReportName(report) },
    { field: 'startDate' as const, value: { kind: 'date' as const, value: report.startDate } },
    { field: 'endDate' as const, value: { kind: 'date' as const, value: report.endDate } },
    ...(reviewFields
      ? [
          {
            field: 'status' as const,
            value: { kind: 'reportStatus' as const, isConsoleView: audience === 'console', value: reviewFields.status },
          },
        ]
      : []),
    { field: 'highlights' as const, value: report.highlights },
    { field: 'financialSummaries' as const, value: report.financialSummaries },
    { field: 'additionalComments' as const, value: report.additionalComments },
    ...(reviewFields ? [{ field: 'feedback' as const, value: reviewFields.feedback }] : []),
    ...(audience === 'console' && acceleratorReport
      ? [
          { field: 'internalComment' as const, value: acceleratorReport.internalComment },
          {
            field: 'unpublishedChanges' as const,
            value: { kind: 'reportSections' as const, value: acceleratorReport.unpublishedProperties },
          },
        ]
      : []),
  ];
};

export type AchievementCsvRow = { achievement: string };

export const makeAchievementCsvRows = ({ report }: ReportCsvParams): AchievementCsvRow[] =>
  report.achievements.map((achievement) => ({ achievement }));

export type ChallengeCsvRow = { challenge: string; mitigationPlan: string };

export const makeChallengeCsvRows = ({ report }: ReportCsvParams): ChallengeCsvRow[] =>
  report.challenges.map(({ challenge, mitigationPlan }) => ({ challenge, mitigationPlan }));

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export type IndicatorCsvColumn =
  | 'refId'
  | 'name'
  | 'type'
  | 'category'
  | 'level'
  | 'classId'
  | 'description'
  | 'unit'
  | 'status'
  | 'baseline'
  | 'previousYearCumulativeTotal'
  | (typeof QUARTERS)[number]
  | 'value'
  | 'cumulativeValue'
  | 'target'
  | 'endOfProjectTarget'
  | 'projectsComments'
  | 'progressNotes'
  | 'supportingDocumentUrl'
  | 'systemValue'
  | 'overrideValue'
  | 'isPublishable';

/** The columns this audience sees, in the order they appear in the sheet. */
export const getIndicatorCsvColumns = (audience: ReportCsvAudience): IndicatorCsvColumn[] => [
  'refId',
  'name',
  'type',
  'category',
  'level',
  'classId',
  'description',
  'unit',
  'status',
  'baseline',
  'previousYearCumulativeTotal',
  ...QUARTERS,
  'value',
  'cumulativeValue',
  'target',
  'endOfProjectTarget',
  'projectsComments',
  'progressNotes',
  'supportingDocumentUrl',
  // the published payload has no Terraware-calculated values to report on
  ...(audience === 'funder' ? [] : (['systemValue', 'overrideValue'] as IndicatorCsvColumn[])),
  // only the console shows which indicators reach funders
  ...(audience === 'console' ? (['isPublishable'] as IndicatorCsvColumn[]) : []),
];

export type IndicatorCsvRow = Partial<Record<IndicatorCsvColumn, ReportCsvValue>>;

/**
 * Indicator values stay numbers so a spreadsheet can still add them up, rounded to the precision the
 * screen rounds to. The published payload carries no precision at all, and falling back to zero
 * decimals there would quietly turn a survival rate into a whole number, so a value with no
 * precision is written as-is.
 */
const indicatorNumber = (value: number | undefined, precision: number | undefined) => {
  if (value === undefined) {
    return undefined;
  }

  return precision === undefined ? value : roundToDecimal(value, precision);
};

/** One row per indicator, in the order the progress section renders them. */
export const makeIndicatorCsvRows = ({ indicators }: ReportCsvParams): IndicatorCsvRow[] =>
  [...indicators]
    .sort((a, b) => compareRefIds(a.refId, b.refId))
    .map((indicator) => {
      const asNumber = (value?: number) => indicatorNumber(value, indicator.precision);

      const quarterValues = Object.fromEntries(
        QUARTERS.map((quarter) => [
          quarter,
          asNumber(indicator.currentYearProgress?.find((progress) => progress.quarter === quarter)?.value),
        ])
      );

      return {
        ...quarterValues,
        baseline: asNumber(indicator.baseline),
        category: { kind: 'indicatorCategory' as const, value: indicator.category },
        classId: { kind: 'indicatorClass' as const, value: indicator.classId },
        cumulativeValue: asNumber(getIndicatorCumulativeValue(indicator)),
        description: indicator.description,
        endOfProjectTarget: asNumber(indicator.endOfProjectTarget),
        isPublishable: { kind: 'boolean' as const, value: indicator.isPublishable },
        level: { kind: 'indicatorLevel' as const, value: indicator.level },
        name: indicator.name,
        overrideValue: asNumber(indicator.overrideValue),
        previousYearCumulativeTotal: asNumber(indicator.previousYearCumulativeTotal),
        progressNotes: indicator.progressNotes,
        projectsComments: indicator.projectsComments,
        refId: indicator.refId,
        status: { kind: 'metricStatus' as const, value: indicator.status },
        supportingDocumentUrl: indicator.supportingDocumentUrl,
        systemValue: asNumber(indicator.systemValue),
        target: asNumber(indicator.target),
        type: { kind: 'indicatorType' as const, value: indicator.type },
        unit: indicator.unit,
        value: asNumber(indicator.value),
      };
    });

export type ExportAcceleratorReportParams = {
  /** the deal name in the console, the project name for a participant */
  projectName?: string;
  reportId: number;
};

export type ExportFunderReportParams = {
  /** the published report endpoint is project scoped, so it takes the project as well as the report */
  projectId: number;
  reportId: number;
};

/**
 * Exports a report as a zipfile of CSVs covering the fields its reader can see. Everything that has
 * to be rendered for a reader — headings, enum values, dates — happens in here, so the row builders
 * above stay locale-free and can be unit-tested on their own.
 *
 * There is one callback per source endpoint, because which fields reach the reader follows from where
 * the report came from rather than from who is asking: the published snapshot holds exactly what
 * funders are allowed to see, while the working report holds the review state and the indicators that
 * never leave the console. Within the working report, the route separates the console from the
 * participant whose report it is.
 */
const useExportReportCsv = () => {
  const { activeLocale, strings } = useLocalization();
  const snackbar = useSnackbar();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const [getAcceleratorReport] = useLazyGetOneAcceleratorReportQuery();
  const [listPublishedReports] = useLazyListPublishedReportsQuery();

  const indicatorTypeLabel = useCallback(
    (type?: IndicatorType) => {
      switch (type) {
        case 'autoCalculated':
          return strings.AUTO_CALCULATED;
        case 'common':
          return strings.STANDARD;
        case 'project':
          return strings.PROJECT_SPECIFIC;
        default:
          return '';
      }
    },
    [strings]
  );

  const localizeValue = useCallback(
    (value: ReportCsvValue) => {
      if (!isLocalizedCsvValue(value)) {
        return value;
      }

      switch (value.kind) {
        case 'boolean':
          return value.value ? strings.YES : strings.NO;
        case 'date':
          return getMediumDate(value.value, activeLocale);
        case 'indicatorCategory':
          return indicatorCategoryLabel(value.value, strings);
        case 'indicatorClass':
          return indicatorClassLabel(value.value, strings);
        case 'indicatorLevel':
          return indicatorLevelLabel(value.value, strings);
        case 'indicatorType':
          return indicatorTypeLabel(value.value);
        case 'metricStatus':
          return metricStatusLabel(value.value, strings);
        case 'reportSections':
          return unpublishedPropertyList(value.value, strings);
        case 'reportStatus':
          return acceleratorReportStatusLabel(value.value, strings, value.isConsoleView);
      }
    },
    [activeLocale, indicatorTypeLabel, strings]
  );

  const reportFieldLabels = useMemo(
    (): Record<ReportCsvField, string> => ({
      additionalComments: strings.ADDITIONAL_COMMENTS,
      endDate: strings.END_DATE,
      feedback: strings.FEEDBACK,
      financialSummaries: strings.FINANCIAL_SUMMARIES,
      highlights: strings.HIGHLIGHTS,
      internalComment: strings.INTERNAL_COMMENT,
      project: strings.PROJECT,
      report: strings.REPORT,
      startDate: strings.START_DATE,
      status: strings.STATUS,
      unpublishedChanges: strings.UNPUBLISHED_CHANGES,
    }),
    [strings]
  );

  const indicatorColumnLabels = useMemo(
    (): Record<IndicatorCsvColumn, string> => ({
      Q1: 'Q1',
      Q2: 'Q2',
      Q3: 'Q3',
      Q4: 'Q4',
      baseline: strings.BASELINE,
      category: strings.CATEGORY,
      classId: strings.INDICATOR_CLASS,
      cumulativeValue: strings.CUMULATIVE_PROGRESS,
      description: strings.DESCRIPTION,
      endOfProjectTarget: strings.END_OF_PROJECT_TARGET,
      isPublishable: strings.SHARED_WITH_FUNDER,
      level: strings.INDICATOR_LEVEL,
      name: strings.INDICATOR_NAME,
      overrideValue: strings.OVERWRITTEN_VALUE,
      previousYearCumulativeTotal: strings.PREVIOUS_YEAR_CUMULATIVE_TOTAL,
      progressNotes: strings.PROGRESS_NOTES,
      projectsComments: strings.PROJECTS_COMMENTS,
      refId: strings.REFERENCE_ID,
      status: strings.STATUS,
      supportingDocumentUrl: strings.LINK_TO_SUPPORTING_DOCUMENTS,
      systemValue: strings.TERRAWARE_VALUE,
      target: strings.TARGET,
      type: strings.INDICATOR_TYPE,
      unit: strings.UNIT,
      value: strings.PROGRESS_VALUE,
    }),
    [strings]
  );

  const makeIndicatorsCsv = useCallback(
    (params: ReportCsvParams) => {
      const columnKeys = getIndicatorCsvColumns(params.audience);
      const columns: ColumnHeader[] = columnKeys.map((key) => ({ key, displayLabel: indicatorColumnLabels[key] }));

      const rows = makeIndicatorCsvRows(params).map((row) =>
        Object.fromEntries(columnKeys.map((key) => [key, localizeValue(row[key])]))
      );

      return makeCsv(columns, rows as CsvData[]);
    },
    [indicatorColumnLabels, localizeValue]
  );

  const downloadCsvZip = useCallback(
    async (params: ReportCsvParams) => {
      const reportRows = makeReportCsvRows(params).map(({ field, value }) => ({
        field: reportFieldLabels[field],
        value: localizeValue(value),
      }));

      // `.csv` goes in the file name rather than in `suffix` because the blobs already carry the
      // UTF-8 BOM that Excel wants, and downloadZipFile adds a second one to anything suffixed `.csv`
      await downloadZipFile({
        dirName: [params.projectName, getReportName(params.report), strings.REPORT].filter(Boolean).join('-'),
        files: [
          {
            fileName: `${strings.REPORT}.csv`,
            content: makeCsv(
              [
                { key: 'field', displayLabel: strings.FIELD },
                { key: 'value', displayLabel: strings.VALUE },
              ],
              reportRows as CsvData[]
            ),
          },
          {
            fileName: `${strings.ACHIEVEMENTS}.csv`,
            content: makeCsv(
              [{ key: 'achievement', displayLabel: strings.ACHIEVEMENT }],
              makeAchievementCsvRows(params)
            ),
          },
          {
            fileName: `${strings.CHALLENGES_AND_MITIGATION_PLAN}.csv`,
            content: makeCsv(
              [
                { key: 'challenge', displayLabel: strings.CHALLENGE },
                { key: 'mitigationPlan', displayLabel: strings.MITIGATION_PLAN },
              ],
              makeChallengeCsvRows(params)
            ),
          },
          { fileName: `${strings.INDICATORS}.csv`, content: makeIndicatorsCsv(params) },
        ],
      });
    },
    [localizeValue, makeIndicatorsCsv, reportFieldLabels, strings]
  );

  const exportAcceleratorReport = useCallback(
    async ({ projectName, reportId }: ExportAcceleratorReportParams) => {
      try {
        const { report } = await getAcceleratorReport({ reportId, includeIndicators: true }, true).unwrap();

        await downloadCsvZip({
          audience: isAcceleratorRoute ? 'console' : 'participant',
          indicators: getProgressIndicators(report),
          projectName,
          report,
        });
      } catch {
        snackbar.toastError();
      }
    },
    [downloadCsvZip, getAcceleratorReport, isAcceleratorRoute, snackbar]
  );

  const exportFunderReport = useCallback(
    async ({ projectId, reportId }: ExportFunderReportParams) => {
      try {
        const { reports } = await listPublishedReports(projectId, true).unwrap();
        const report = reports.find((publishedReport) => publishedReport.reportId === reportId);

        if (report === undefined) {
          snackbar.toastError();
          return;
        }

        await downloadCsvZip({
          audience: 'funder',
          indicators: getPublishedProgressIndicators(report),
          projectName: report.projectName,
          report,
        });
      } catch {
        snackbar.toastError();
      }
    },
    [downloadCsvZip, listPublishedReports, snackbar]
  );

  return { exportAcceleratorReport, exportFunderReport };
};

export default useExportReportCsv;
