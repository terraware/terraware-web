import React, { useEffect, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import Table from 'src/components/common/table';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { selectListAcceleratorReports } from 'src/redux/features/reports/reportsSelectors';
import { requestListAcceleratorReports } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AcceleratorReport } from 'src/types/AcceleratorReport';

import ReportCellRenderer from './ReportCellRenderer';

export default function ReportsList(): JSX.Element {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { currentParticipantProject } = useParticipantData();

  const [acceleratorReports, setAcceleratorReports] = useState<AcceleratorReport[]>([]);
  const [listAcceleratorReportsRequestId, setListAcceleratorReportsRequestId] = useState<string>('');

  const acceleratorReportsListRequest = useAppSelector(selectListAcceleratorReports(listAcceleratorReportsRequestId));

  useEffect(() => {
    if (!currentParticipantProject?.id) {
      return;
    }

    const dispatched = dispatch(requestListAcceleratorReports({ projectId: currentParticipantProject.id }));
    setListAcceleratorReportsRequestId(dispatched.requestId);
  }, [currentParticipantProject?.id, dispatch, setListAcceleratorReportsRequestId]);

  useEffect(() => {
    if (acceleratorReportsListRequest?.status === 'success') {
      const nextAcceleratorReports = acceleratorReportsListRequest?.data || [];

      setAcceleratorReports(nextAcceleratorReports);
    }
  }, [acceleratorReportsListRequest]);

  const gridStyle = {
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  };

  const columns = (): TableColumnType[] => [
    {
      key: 'report',
      name: strings.REPORT,
      type: 'string',
    },
    {
      key: 'status',
      name: strings.STATUS,
      type: 'string',
    },
    {
      key: 'year',
      name: strings.YEAR,
      type: 'string',
    },
    {
      key: 'modifiedBy',
      name: strings.LAST_EDITED_BY,
      type: 'string',
    },
    {
      key: 'submittedBy',
      name: strings.SUBMITTED_BY,
      type: 'string',
    },
    {
      key: 'submittedTime',
      name: strings.DATE_SUBMITTED,
      type: 'string',
    },
  ];

  // TODO: remove mockRows once reports are ready
  const mockRows: AcceleratorReport[] = [
    {
      endDate: '2023-12-31',
      id: 1,
      modifiedBy: 78,
      modifiedTime: '2023-10-01',
      projectId: -1,
      projectMetrics: [],
      standardMetrics: [],
      startDate: '2023-01-01',
      status: 'Not Submitted',
      submittedBy: 78,
      submittedTime: '2023-10-01',
      systemMetrics: [],
    },
    {
      endDate: '2023-12-31',
      id: 2,
      modifiedBy: 78,
      modifiedTime: '2023-10-01',
      projectId: -1,
      projectMetrics: [],
      standardMetrics: [],
      startDate: '2023-01-01',
      status: 'Submitted',
      submittedBy: 78,
      submittedTime: '2023-10-01',
      systemMetrics: [],
    },
  ];

  // TODO: update table to include search filters
  return (
    <Card style={{ display: 'flex', flexDirection: 'column' }} title={strings.TARGETS}>
      <Grid container sx={gridStyle}>
        <Grid item xs={12} textAlign={'center'}>
          {mockRows && mockRows.length > 0 ? (
            <Table
              columns={columns}
              id='accelerator-reports-table'
              isClickable={() => false}
              orderBy='name'
              Renderer={ReportCellRenderer}
              rows={mockRows}
              showTopBar={false}
            />
          ) : (
            <Typography>{strings.NO_REPORTS_TO_SHOW}</Typography>
          )}
        </Grid>
      </Grid>
    </Card>
  );
}
