import React, { type JSX } from 'react';

import AchievementsBox from 'src/components/AcceleratorReports/AchievementsBox';
import AdditionalCommentsBox from 'src/components/AcceleratorReports/AdditionalCommentsBox';
import ChallengesMitigationBox from 'src/components/AcceleratorReports/ChallengesMitigationBox';
import FinancialSummariesBox from 'src/components/AcceleratorReports/FinancialSummaryBox';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import IndicatorProgressSection from 'src/components/AcceleratorReports/IndicatorProgressSection';
import { AcceleratorReportPayload } from 'src/queries/generated/reports';

export type ReportEditFieldsProps = {
  onChangeCallback: (id: string) => (value: unknown) => void;
  record: AcceleratorReportPayload;
  validate?: boolean;
};

const ReportEditFields = ({ onChangeCallback, record, validate }: ReportEditFieldsProps): JSX.Element => {
  const projectId = record.projectId;

  return (
    <>
      <HighlightsBox editing onChange={onChangeCallback('highlights')} projectId={projectId} report={record} />

      {/* indicator progress has no editing state yet, so it stays read only here */}
      <IndicatorProgressSection reportId={record.id} />

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
