import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';

import AcceleratorReportStatusBadge from 'src/components/AcceleratorReports/AcceleratorReportStatusBadge';
import HighlightsBox from 'src/components/AcceleratorReports/HighlightsBox';
import ProjectHealthBar from 'src/components/AcceleratorReports/ProjectHealthBar';
import ReportDropdown, { ReportOption } from 'src/components/AcceleratorReports/ReportDropdown';
import ReportEmptyState from 'src/components/AcceleratorReports/ReportEmptyState';
import { getReportName } from 'src/components/AcceleratorReports/utils';
import Card from 'src/components/common/Card';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { useLazyListAcceleratorReportsQuery } from 'src/queries/generated/reports';
import useQuery from 'src/utils/useQuery';

const AcceleratorReportTabV2 = (): JSX.Element => {
  const theme = useTheme();
  const { allAcceleratorProjects, currentAcceleratorProject, setCurrentAcceleratorProject } = useParticipantData();
  const query = useQuery();

  const [selectedReportId, setSelectedReportId] = useState<number | undefined>(
    Number(query.get('reportId')) || undefined
  );

  const { report: selectedReport } = useOneAcceleratorReport(selectedReportId);

  const selectedProjectId = selectedReport?.projectId;

  useEffect(() => {
    if (
      selectedProjectId !== undefined &&
      selectedProjectId !== currentAcceleratorProject?.id &&
      allAcceleratorProjects.some((project) => project.id === selectedProjectId)
    ) {
      setCurrentAcceleratorProject(selectedProjectId);
    }
  }, [allAcceleratorProjects, currentAcceleratorProject?.id, selectedProjectId, setCurrentAcceleratorProject]);

  const projectId = currentAcceleratorProject?.id;

  const [listReports, listReportsResponse] = useLazyListAcceleratorReportsQuery();

  useEffect(() => {
    if (projectId !== undefined) {
      void listReports({ projectId }, true);
    }
  }, [listReports, projectId]);

  const reports = useMemo<ReportOption[]>(
    () =>
      listReportsResponse.currentData?.reports.map((report) => ({
        reportId: report.id,
        title: getReportName(report) ?? '',
      })) ?? [],
    [listReportsResponse.currentData]
  );

  const resolvedReportId = useMemo(
    () => reports.find((report) => report.reportId === selectedReportId)?.reportId ?? reports[0]?.reportId,
    [reports, selectedReportId]
  );

  const isEmpty = listReportsResponse.currentData !== undefined && reports.length === 0;

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

          {projectId !== undefined && (
            <HighlightsBox key={resolvedReportId} projectId={projectId} report={selectedReport} />
          )}
        </>
      )}
    </Card>
  );
};

export default AcceleratorReportTabV2;
