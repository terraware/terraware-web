import React, { type JSX, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import ReportDropdown, { ReportOption } from 'src/components/AcceleratorReports/ReportDropdown';
import { getReportName } from 'src/components/AcceleratorReports/utils';
import Card from 'src/components/common/Card';
import { useListPublishedReportsQuery } from 'src/queries/generated/publishedReports';
import useQuery from 'src/utils/useQuery';

export type FunderReportTabV2Props = {
  selectedProjectId: number;
};

const FunderReportTabV2 = ({ selectedProjectId }: FunderReportTabV2Props): JSX.Element => {
  const theme = useTheme();
  const query = useQuery();

  // The tab has no path of its own, so deep links arrive as a reportId query param
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

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
      <Box marginBottom={theme.spacing(3)}>
        <ReportDropdown onChange={setSelectedReportId} reports={reports} selectedReportId={selectedReportId} />
      </Box>

      <Box display='flex' flexGrow={1} alignItems='center' justifyContent='center'>
        <Typography>{`Funder report view (project ${selectedProjectId}, report ${selectedReportId})`}</Typography>
      </Box>
    </Card>
  );
};

export default FunderReportTabV2;
