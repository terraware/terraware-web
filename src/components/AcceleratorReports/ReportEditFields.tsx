import React, { type JSX, useCallback, useMemo } from 'react';

import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import AdditionalCommentsBox from 'src/components/AcceleratorReports/AdditionalCommentsBox';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import FinancialSummariesBox from 'src/components/AcceleratorReports/FinancialSummaryBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import { ProgressIndicator } from 'src/components/AcceleratorReports/IndicatorProgressRow';
import { IndicatorProgressSectionContent } from 'src/components/AcceleratorReports/IndicatorProgressSection';
import { AcceleratorReportPayload } from 'src/queries/generated/acceleratorReports';

const INDICATOR_FIELDS: Record<string, keyof AcceleratorReportPayload> = {
  autoCalculated: 'autoCalculatedIndicators',
  common: 'commonIndicators',
  project: 'projectIndicators',
};

export type ReportEditFieldsProps = {
  onChangeCallback: (id: string) => (value: unknown) => void;
  record: AcceleratorReportPayload;
  isConsoleView?: boolean;
  validate?: boolean;
};

const ReportEditFields = ({
  onChangeCallback,
  record,
  isConsoleView,
  validate,
}: ReportEditFieldsProps): JSX.Element => {
  const projectId = record.projectId;

  const indicators = useMemo<ProgressIndicator[]>(
    () => [
      ...record.commonIndicators.map((indicator) => ({ ...indicator, type: 'common' as const })),
      ...record.projectIndicators.map((indicator) => ({ ...indicator, type: 'project' as const })),
      ...record.autoCalculatedIndicators.map((indicator) => ({
        ...indicator,
        name: indicator.indicator,
        type: 'autoCalculated' as const,
        value: indicator.overrideValue ?? indicator.systemValue,
      })),
    ],
    [record.autoCalculatedIndicators, record.commonIndicators, record.projectIndicators]
  );

  const onChangeIndicator = useCallback(
    (indicator: ProgressIndicator, id: string, value: unknown) => {
      const field = indicator.type ? INDICATOR_FIELDS[indicator.type] : undefined;

      if (!field) {
        return;
      }

      // reference ids repeat across indicators, so match on the identity the payload actually keys on
      const isMatch = (entry: { id?: number; indicator?: string }) =>
        indicator.type === 'autoCalculated' ? entry.indicator === indicator.name : entry.id === indicator.id;

      const current = record[field] as { id?: number; indicator?: string }[];
      onChangeCallback(field)(current.map((entry) => (isMatch(entry) ? { ...entry, [id]: value } : entry)));
    },
    [onChangeCallback, record]
  );

  return (
    <>
      <HighlightsBox editing onChange={onChangeCallback('highlights')} projectId={projectId} report={record} />

      <IndicatorProgressSectionContent
        editing
        indicators={indicators}
        onChangeIndicator={onChangeIndicator}
        quarter={record.quarter}
        isConsoleView={isConsoleView}
        year={Number(record.startDate?.split('-')[0]) || undefined}
      />

      <AchievementsBox editing onChange={onChangeCallback('achievements')} projectId={projectId} report={record} />

      <ChallengesMitigationBox
        editing
        onChange={onChangeCallback('challenges')}
        projectId={projectId}
        report={record}
        validate={validate}
      />

      <FinancialSummariesBox
        editing
        onChange={onChangeCallback('financialSummaries')}
        projectId={projectId}
        report={record}
      />

      <AdditionalCommentsBox
        editing
        onChange={onChangeCallback('additionalComments')}
        projectId={projectId}
        report={record}
      />
    </>
  );
};

export default ReportEditFields;
