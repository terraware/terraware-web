import React, { type JSX, useMemo, useState } from 'react';

import { useTheme } from '@mui/material';

import FunderReportContentV2 from 'src/components/AcceleratorReports/FunderReportContentV2';
import { ProgressIndicator } from 'src/components/AcceleratorReports/IndicatorProgressRow';
import ReportDropdown, { ReportOption } from 'src/components/AcceleratorReports/ReportDropdown';
import ReportEmptyState from 'src/components/AcceleratorReports/ReportEmptyState';
import { getReportName } from 'src/components/AcceleratorReports/utils';
import Card from 'src/components/common/Card';
import { useListPublishedReportsQuery } from 'src/queries/generated/publishedReports';
import useQuery from 'src/utils/useQuery';

type FunderReportTabV2Props = {
  selectedProjectId: number;
};

const FunderReportTabV2 = ({ selectedProjectId }: FunderReportTabV2Props): JSX.Element => {
  const theme = useTheme();
  const query = useQuery();

  const [selectedReportId, setSelectedReportId] = useState<number | undefined>(
    Number(query.get('reportId')) || undefined
  );

  const { currentData: listPublishedReportsData } = useListPublishedReportsQuery(selectedProjectId);

  const reports = useMemo<ReportOption[]>(
    () =>
      listPublishedReportsData?.reports.map((report) => ({
        reportId: report.reportId,
        title: getReportName(report) ?? '',
      })) ?? [],
    [listPublishedReportsData]
  );

  const resolvedReportId = useMemo(
    () => reports.find((report) => report.reportId === selectedReportId)?.reportId ?? reports[0]?.reportId,
    [reports, selectedReportId]
  );

  const selectedReport = useMemo(
    () => listPublishedReportsData?.reports.find((report) => report.reportId === resolvedReportId),
    [listPublishedReportsData, resolvedReportId]
  );

  // the published payload only ever carries the indicators funders are allowed to see
  const indicators = useMemo<ProgressIndicator[]>(
    () => [
      ...(selectedReport?.autoCalculatedIndicators ?? []),
      ...(selectedReport?.commonIndicators ?? []),
      ...(selectedReport?.projectIndicators ?? []),
    ],
    [selectedReport]
  );

  const isEmpty = listPublishedReportsData !== undefined && reports.length === 0;

  if (isEmpty) {
    return (
      <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
        <ReportEmptyState />
      </Card>
    );
  }

  return (
    <FunderReportContentV2
      header={<ReportDropdown onChange={setSelectedReportId} reports={reports} selectedReportId={resolvedReportId} />}
      indicators={indicators}
      projectId={selectedProjectId}
      report={selectedReport}
    />
  );
};

export default FunderReportTabV2;
