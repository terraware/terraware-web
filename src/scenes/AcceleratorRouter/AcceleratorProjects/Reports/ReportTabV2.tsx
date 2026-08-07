import React, { type JSX, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';

import ReportDropdown, { ReportOption } from 'src/components/AcceleratorReports/ReportDropdown';
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

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
      <Box marginBottom={theme.spacing(3)}>
        <ReportDropdown onChange={setSelectedReportId} reports={reports} selectedReportId={selectedReportId} />
      </Box>

      <Box display='flex' flexGrow={1} alignItems='center' justifyContent='center'>
        <Typography>{`Accelerator report view (report ${selectedReportId})`}</Typography>
      </Box>
    </Card>
  );
};

export default ReportTabV2;
