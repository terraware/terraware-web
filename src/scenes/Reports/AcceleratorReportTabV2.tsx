import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import ReportDropdown, { ReportOption } from 'src/components/AcceleratorReports/ReportDropdown';
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

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
      <Box marginBottom={theme.spacing(3)}>
        <ReportDropdown onChange={setSelectedReportId} reports={reports} selectedReportId={selectedReportId} />
      </Box>

      <Box display='flex' flexGrow={1} alignItems='center' justifyContent='center'>
        <Typography>{`Participant report view (report ${selectedReportId})`}</Typography>
      </Box>
    </Card>
  );
};

export default AcceleratorReportTabV2;
