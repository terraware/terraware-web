import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';

import FunderReportContentV2 from 'src/components/AcceleratorReports/FunderReportContentV2';
import ReportDropdown, { ReportOption } from 'src/components/AcceleratorReports/ReportDropdown';
import ReportEmptyState from 'src/components/AcceleratorReports/ReportEmptyState';
import ReportExportMenu from 'src/components/AcceleratorReports/ReportExportMenu';
import ReportPrint from 'src/components/AcceleratorReports/ReportPrint';
import useExportReportCsv from 'src/components/AcceleratorReports/useExportReportCsv';
import { getPublishedProgressIndicators, getReportName } from 'src/components/AcceleratorReports/utils';
import Card from 'src/components/common/Card';
import { useListPublishedReportsQuery } from 'src/queries/generated/publishedReports';
import useQuery from 'src/utils/useQuery';

type FunderReportTabV2Props = {
  selectedProjectId: number;
};

const FunderReportTabV2 = ({ selectedProjectId }: FunderReportTabV2Props): JSX.Element => {
  const theme = useTheme();
  const query = useQuery();
  const { exportFunderReport } = useExportReportCsv();

  const [selectedReportId, setSelectedReportId] = useState<number | undefined>(
    Number(query.get('reportId')) || undefined
  );
  const [printing, setPrinting] = useState(false);

  const startPrinting = useCallback(() => setPrinting(true), []);
  const stopPrinting = useCallback(() => setPrinting(false), []);

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

  const indicators = useMemo(() => getPublishedProgressIndicators(selectedReport), [selectedReport]);

  const isEmpty = listPublishedReportsData !== undefined && reports.length === 0;

  if (isEmpty) {
    return (
      <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
        <ReportEmptyState />
      </Card>
    );
  }

  return (
    <>
      {printing && (
        <ReportPrint
          indicators={indicators}
          onClose={stopPrinting}
          projectName={selectedReport?.projectName}
          report={selectedReport}
        />
      )}

      <FunderReportContentV2
        header={
          <Box alignItems='center' display='flex' justifyContent='space-between'>
            <ReportDropdown onChange={setSelectedReportId} reports={reports} selectedReportId={resolvedReportId} />

            <ReportExportMenu
              disabled={resolvedReportId === undefined}
              onExport={() =>
                resolvedReportId !== undefined &&
                void exportFunderReport({ projectId: selectedProjectId, reportId: resolvedReportId })
              }
              onPrint={startPrinting}
            />
          </Box>
        }
        indicators={indicators}
        projectId={selectedProjectId}
        report={selectedReport}
      />
    </>
  );
};

export default FunderReportTabV2;
