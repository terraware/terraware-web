import { useCallback } from 'react';

import { ColumnHeader } from 'export-to-csv';

import {
  ProgressIndicator,
  compareRefIds,
  getIndicatorCumulativeValue,
  getProgressIndicators,
  getPublishedProgressIndicators,
  getReportName,
  indicatorClassLabel,
  unpublishedPropertyList,
} from 'src/components/AcceleratorReports/utils';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import {
  AcceleratorReportPayload,
  useLazyGetOneAcceleratorReportQuery,
} from 'src/queries/generated/acceleratorReports';
import { PublishedReportPayload, useLazyListPublishedReportsQuery } from 'src/queries/generated/publishedReports';
import { ILocalizedStrings } from 'src/strings';
import { isAcceleratorReport } from 'src/types/AcceleratorReport';
import { CsvData, makeCsv } from 'src/utils/csv';
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

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

/**
 * Indicator values are written as numbers so a spreadsheet can still add them up, rounded to the
 * precision the screen rounds to. The published payload carries no precision at all, and falling
 * back to zero decimals there would quietly turn a survival rate into a whole number, so a value
 * with no precision is written as-is.
 */
const indicatorNumber = (value: number | undefined, precision: number | undefined) => {
  if (value === undefined) {
    return undefined;
  }

  return precision === undefined ? value : roundToDecimal(value, precision);
};

const indicatorTypeLabel = (type: ProgressIndicator['type'], strings: ILocalizedStrings) => {
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
};

/** A single-record sheet, so the report's long-form narrative fields stay readable in a spreadsheet. */
export const makeReportCsv = (params: ReportCsvParams, strings: ILocalizedStrings): Blob => {
  const { audience, projectName, report } = params;

  const columns: ColumnHeader[] = [
    { key: 'field', displayLabel: strings.FIELD },
    { key: 'value', displayLabel: strings.VALUE },
  ];

  const acceleratorReport = isAcceleratorReport(report) ? report : undefined;
  // the funder-facing views never show the working report's review state, even when rendering one
  const reviewFields = audience !== 'funder' ? acceleratorReport : undefined;

  const rows: { field: string; value?: string }[] = [
    ...(projectName ? [{ field: strings.PROJECT, value: projectName }] : []),
    { field: strings.REPORT, value: getReportName(report) },
    { field: strings.START_DATE, value: report.startDate },
    { field: strings.END_DATE, value: report.endDate },
    ...(reviewFields ? [{ field: strings.STATUS, value: reviewFields.status }] : []),
    { field: strings.HIGHLIGHTS, value: report.highlights },
    { field: strings.FINANCIAL_SUMMARIES, value: report.financialSummaries },
    { field: strings.ADDITIONAL_COMMENTS, value: report.additionalComments },
    ...(reviewFields ? [{ field: strings.FEEDBACK, value: reviewFields.feedback }] : []),
    ...(audience === 'console' && acceleratorReport
      ? [
          { field: strings.INTERNAL_COMMENT, value: acceleratorReport.internalComment },
          {
            field: strings.UNPUBLISHED_CHANGES,
            value: unpublishedPropertyList(acceleratorReport.unpublishedProperties, strings),
          },
        ]
      : []),
  ];

  return makeCsv(columns, rows as CsvData[]);
};

export const makeAchievementsCsv = (params: ReportCsvParams, strings: ILocalizedStrings): Blob =>
  makeCsv(
    [{ key: 'achievement', displayLabel: strings.ACHIEVEMENT }],
    params.report.achievements.map((achievement) => ({ achievement }))
  );

export const makeChallengesCsv = (params: ReportCsvParams, strings: ILocalizedStrings): Blob =>
  makeCsv(
    [
      { key: 'challenge', displayLabel: strings.CHALLENGE },
      { key: 'mitigationPlan', displayLabel: strings.MITIGATION_PLAN },
    ],
    params.report.challenges.map(({ challenge, mitigationPlan }) => ({ challenge, mitigationPlan }))
  );

export const makeIndicatorsCsv = (params: ReportCsvParams, strings: ILocalizedStrings): Blob => {
  const { audience, indicators } = params;

  const columns: ColumnHeader[] = [
    { key: 'refId', displayLabel: strings.REFERENCE_ID },
    { key: 'name', displayLabel: strings.INDICATOR_NAME },
    { key: 'type', displayLabel: strings.INDICATOR_TYPE },
    { key: 'category', displayLabel: strings.CATEGORY },
    { key: 'level', displayLabel: strings.INDICATOR_LEVEL },
    { key: 'classId', displayLabel: strings.INDICATOR_CLASS },
    { key: 'description', displayLabel: strings.DESCRIPTION },
    { key: 'unit', displayLabel: strings.UNIT },
    { key: 'status', displayLabel: strings.STATUS },
    { key: 'baseline', displayLabel: strings.BASELINE },
    { key: 'previousYearCumulativeTotal', displayLabel: strings.PREVIOUS_YEAR_CUMULATIVE_TOTAL },
    ...QUARTERS.map((quarter) => ({ key: quarter, displayLabel: quarter })),
    { key: 'value', displayLabel: strings.PROGRESS_VALUE },
    { key: 'cumulativeValue', displayLabel: strings.CUMULATIVE_PROGRESS },
    { key: 'target', displayLabel: strings.TARGET },
    { key: 'endOfProjectTarget', displayLabel: strings.END_OF_PROJECT_TARGET },
    { key: 'projectsComments', displayLabel: strings.PROJECTS_COMMENTS },
    { key: 'progressNotes', displayLabel: strings.PROGRESS_NOTES },
    { key: 'supportingDocumentUrl', displayLabel: strings.LINK_TO_SUPPORTING_DOCUMENTS },
    // the published payload has no Terraware-calculated values to report on
    ...(audience === 'funder'
      ? []
      : [
          { key: 'systemValue', displayLabel: strings.TERRAWARE_VALUE },
          { key: 'overrideValue', displayLabel: strings.OVERWRITTEN_VALUE },
        ]),
    // only the console shows which indicators reach funders
    ...(audience === 'console' ? [{ key: 'isPublishable', displayLabel: strings.SHARED_WITH_FUNDER }] : []),
  ];

  const rows = [...indicators]
    .sort((a, b) => compareRefIds(a.refId, b.refId))
    .map((indicator) => {
      const precision = indicator.precision;
      const asNumber = (value?: number) => indicatorNumber(value, precision);

      const quarterValues = Object.fromEntries(
        QUARTERS.map((quarter) => [
          quarter,
          asNumber(indicator.currentYearProgress?.find((progress) => progress.quarter === quarter)?.value),
        ])
      );

      return {
        ...quarterValues,
        baseline: asNumber(indicator.baseline),
        category: indicator.category,
        classId: indicatorClassLabel(indicator.classId, strings),
        cumulativeValue: asNumber(getIndicatorCumulativeValue(indicator)),
        description: indicator.description,
        endOfProjectTarget: asNumber(indicator.endOfProjectTarget),
        isPublishable: indicator.isPublishable ? strings.YES : strings.NO,
        level: indicator.level,
        name: indicator.name,
        overrideValue: asNumber(indicator.overrideValue),
        previousYearCumulativeTotal: asNumber(indicator.previousYearCumulativeTotal),
        progressNotes: indicator.progressNotes,
        projectsComments: indicator.projectsComments,
        refId: indicator.refId,
        status: indicator.status,
        supportingDocumentUrl: indicator.supportingDocumentUrl,
        systemValue: asNumber(indicator.systemValue),
        target: asNumber(indicator.target),
        type: indicatorTypeLabel(indicator.type, strings),
        unit: indicator.unit,
        value: asNumber(indicator.value),
      };
    });

  return makeCsv(columns, rows as CsvData[]);
};

/**
 * Downloads the report as a zipfile of CSVs, one per section, holding the fields this audience can
 * see on screen.
 */
const downloadReportCsvZip = async (params: ReportCsvParams, strings: ILocalizedStrings): Promise<void> => {
  const { projectName, report } = params;

  const dirName = [projectName, getReportName(report), strings.REPORT].filter(Boolean).join('-');

  // `.csv` goes in the file name rather than in `suffix` because the blobs already carry the UTF-8
  // BOM that Excel wants, and downloadZipFile adds a second one to anything suffixed `.csv`
  await downloadZipFile({
    dirName,
    files: [
      { fileName: `${strings.REPORT}.csv`, content: makeReportCsv(params, strings) },
      { fileName: `${strings.ACHIEVEMENTS}.csv`, content: makeAchievementsCsv(params, strings) },
      { fileName: `${strings.CHALLENGES_AND_MITIGATION_PLAN}.csv`, content: makeChallengesCsv(params, strings) },
      { fileName: `${strings.INDICATORS}.csv`, content: makeIndicatorsCsv(params, strings) },
    ],
  });
};

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
 * Exports a report as a zipfile of CSVs covering the fields its reader can see.
 *
 * There is one callback per source endpoint, because which fields reach the reader follows from where
 * the report came from rather than from who is asking: the published snapshot holds exactly what
 * funders are allowed to see, while the working report holds the review state and the indicators that
 * never leave the console. Within the working report, the route separates the console from the
 * participant whose report it is.
 */
const useExportReportCsv = () => {
  const { strings } = useLocalization();
  const snackbar = useSnackbar();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const [getAcceleratorReport] = useLazyGetOneAcceleratorReportQuery();
  const [listPublishedReports] = useLazyListPublishedReportsQuery();

  const exportAcceleratorReport = useCallback(
    async ({ projectName, reportId }: ExportAcceleratorReportParams) => {
      try {
        const { report } = await getAcceleratorReport({ reportId, includeIndicators: true }, true).unwrap();

        await downloadReportCsvZip(
          {
            audience: isAcceleratorRoute ? 'console' : 'participant',
            indicators: getProgressIndicators(report),
            projectName,
            report,
          },
          strings
        );
      } catch {
        snackbar.toastError();
      }
    },
    [getAcceleratorReport, isAcceleratorRoute, snackbar, strings]
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

        await downloadReportCsvZip(
          {
            audience: 'funder',
            indicators: getPublishedProgressIndicators(report),
            projectName: report.projectName,
            report,
          },
          strings
        );
      } catch {
        snackbar.toastError();
      }
    },
    [listPublishedReports, snackbar, strings]
  );

  return { exportAcceleratorReport, exportFunderReport };
};

export default useExportReportCsv;
