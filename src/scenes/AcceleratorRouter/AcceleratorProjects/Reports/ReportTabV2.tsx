import React, { type JSX, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, useTheme } from '@mui/material';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import ProjectHealthBar from 'src/components/AcceleratorReports/ProjectHealthBar';
import ReportDropdown, { ReportOption } from 'src/components/AcceleratorReports/ReportDropdown';
import ReportEmptyState from 'src/components/AcceleratorReports/ReportEmptyState';
import { getReportName } from 'src/components/AcceleratorReports/utils';
import Card from 'src/components/common/Card';
import { useListAcceleratorReportsQuery } from 'src/queries/generated/reports';
import useQuery from 'src/utils/useQuery';

const ReportTabV2 = (): JSX.Element => {
  const theme = useTheme();
  const pathParams = useParams<{ projectId: string }>();
  const query = useQuery();

  const projectId = Number(pathParams.projectId);

  const [selectedReportId, setSelectedReportId] = useState<number | undefined>(
    Number(query.get('reportId')) || undefined
  );

  const { currentData: listReportsData } = useListAcceleratorReportsQuery({ projectId });

  const reports = useMemo<ReportOption[]>(
    () =>
      listReportsData?.reports.map((report) => ({
        reportId: report.id,
        title: getReportName(report) ?? '',
      })) ?? [],
    [listReportsData]
  );

  const resolvedReportId = useMemo(
    () => reports.find((report) => report.reportId === selectedReportId)?.reportId ?? reports[0]?.reportId,
    [reports, selectedReportId]
  );

  const selectedReport = useMemo(
    () => listReportsData?.reports.find((report) => report.id === resolvedReportId),
    [listReportsData, resolvedReportId]
  );

  const isEmpty = listReportsData !== undefined && reports.length === 0;

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
      {isEmpty ? (
        <ReportEmptyState />
      ) : (
        <>
          <Box alignItems='center' display='flex' justifyContent='space-between' marginBottom={theme.spacing(3)}>
            <ReportDropdown onChange={setSelectedReportId} reports={reports} selectedReportId={resolvedReportId} />

            {selectedReport && <AcceleratorReportStatusBadge status={selectedReport.status} />}
          </Box>

          <ProjectHealthBar reportId={resolvedReportId} />
        </>
      )}
    </Card>
  );
};

export default ReportTabV2;
