import React, { type JSX, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';

import AcceleratorReportTargetsTable from 'src/components/AcceleratorReports/AcceleratorReportTargetsTable';
import Card from 'src/components/common/Card';
import SegmentControl, { SegmentOption } from 'src/components/common/SegmentControl';
import { useLocalization } from 'src/providers';

import ReportTabV2 from './ReportTabV2';
import ReportsSettings from './ReportsSettings';

export type ReportsSegment = 'reports' | 'targets' | 'indicators';

export const SEGMENT_PATHS: Record<ReportsSegment, string> = {
  reports: '',
  targets: '/targets',
  indicators: '/indicators',
};

type ReportsContentProps = {
  onChangeSegment: (segment: ReportsSegment) => void;
  onSelectReport?: (reportId: number, replace?: boolean) => void;
  segment: ReportsSegment;
  selectedReportId?: number;
};

const ReportsContent = ({
  onChangeSegment,
  onSelectReport,
  segment,
  selectedReportId,
}: ReportsContentProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

  const segments = useMemo<SegmentOption<ReportsSegment>[]>(
    () => [
      { id: 'reports', label: strings.REPORTS },
      { id: 'targets', label: strings.TARGETS },
      { id: 'indicators', label: strings.INDICATORS },
    ],
    [strings]
  );

  // each segment puts this at the top of its own card, so the selector sits on the same white surface
  const header = <SegmentControl segments={segments} selected={segment} onChange={onChangeSegment} />;

  return (
    <Box display='flex' flexDirection='column' flexGrow={1} width='100%'>
      {segment === 'reports' && (
        <ReportTabV2 active header={header} onSelectReport={onSelectReport} selectedReportId={selectedReportId} />
      )}

      {segment === 'targets' && (
        <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <Box marginBottom={theme.spacing(3)}>{header}</Box>
          <AcceleratorReportTargetsTable />
        </Card>
      )}

      {segment === 'indicators' && <ReportsSettings header={header} />}
    </Box>
  );
};

export default ReportsContent;
