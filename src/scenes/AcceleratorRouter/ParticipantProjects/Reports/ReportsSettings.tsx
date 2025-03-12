import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, TableColumnType, Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import Table from 'src/components/common/table';
import useNavigateTo from 'src/hooks/useNavigateTo';
import {
  selectListReportMetrics,
  selectListStandardMetrics,
  selectProjectReportConfig,
} from 'src/redux/features/reports/reportsSelectors';
import {
  requestListProjectMetrics,
  requestListStandardMetrics,
  requestProjectReportConfig,
} from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ProjectMetric, StandardMetric } from 'src/types/AcceleratorReport';

export default function ReportsSettings(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const projectReportConfig = useAppSelector((state) => selectProjectReportConfig(state));
  const dispatch = useAppDispatch();
  const { goToAcceleratorEditReportSettings } = useNavigateTo();
  const [requestId, setRequestId] = useState<string>('');
  const [standardRequestId, setStandardRequestId] = useState<string>('');
  const specificMetricsResponse = useAppSelector(selectListReportMetrics(requestId));
  const standardMetricsResponse = useAppSelector(selectListStandardMetrics(standardRequestId));
  const [metrics, setMetrics] = useState<ProjectMetric[]>();
  const [standardMetrics, setStandardMetrics] = useState<StandardMetric[]>();
  const [selectedRows, setSelectedRows] = useState<ProjectMetric[]>([]);

  useEffect(() => {
    const dispatched = dispatch(requestListStandardMetrics());
    setStandardRequestId(dispatched.requestId);
  }, []);

  useEffect(() => {
    const dispatched = dispatch(requestListProjectMetrics({ projectId }));
    setRequestId(dispatched.requestId);
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      dispatch(requestProjectReportConfig(projectId));
    }
  }, [projectId]);

  useEffect(() => {
    if (specificMetricsResponse && specificMetricsResponse.status === 'success') {
      setMetrics(specificMetricsResponse.data);
    }
  }, [specificMetricsResponse]);

  useEffect(() => {
    if (standardMetricsResponse && standardMetricsResponse.status === 'success') {
      setStandardMetrics(standardMetricsResponse.data);
    }
  }, [standardMetricsResponse]);

  const gridSize = isMobile ? 12 : 4;

  const gridStyle = {
    borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  };

  const data: Record<string, any>[] = useMemo(() => {
    return [
      { label: strings.START_DATE, value: projectReportConfig.config?.reportingStartDate },
      { label: strings.END_DATE, value: projectReportConfig.config?.reportingEndDate },
      { label: strings.LOG_FRAME_AND_ME_PLAN_URL, value: '' },
    ];
  }, [projectReportConfig]);

  const title = (text: string, marginTop?: number, marginBottom?: number) => (
    <Typography
      fontSize='20px'
      lineHeight='28px'
      fontWeight={600}
      color={theme.palette.TwClrTxt}
      margin={theme.spacing(marginTop ?? 3, 0, marginBottom ?? 2)}
    >
      {text}
    </Typography>
  );

  const goToEditSettings = () => {
    goToAcceleratorEditReportSettings(projectId);
  };

  const columns = (): TableColumnType[] => [
    {
      key: 'name',
      name: strings.NAME,
      type: 'string',
    },
    {
      key: 'type',
      name: strings.TYPE,
      type: 'string',
    },
    {
      key: 'reference',
      name: strings.REFERENCE,
      type: 'string',
    },
    {
      key: 'component',
      name: strings.COMPONENT,
      type: 'string',
    },
  ];

  return (
    <>
      <Card
        style={{ display: 'flex', flexDirection: 'column' }}
        title={strings.SETTINGS}
        rightComponent={
          <Button label={strings.EDIT_SETTINGS} icon='iconEdit' onClick={goToEditSettings} priority='secondary' />
        }
      >
        <Grid container sx={gridStyle}>
          {data.map((datum, index) => (
            <Grid key={index} item xs={gridSize} marginTop={2}>
              <Textfield
                id={`plot-observation-${index}`}
                label={datum.label}
                value={datum.value}
                type={datum.text ? 'textarea' : 'text'}
                preserveNewlines={true}
                display={true}
              />
            </Grid>
          ))}
        </Grid>
        <Grid container sx={gridStyle}>
          <Grid item xs={12} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
            {title(strings.PROJECT_SPECIFIC_METRICS)}
            <Box>
              <Button label={strings.ADD_METRIC} icon='plus' onClick={() => true} priority='secondary' />
            </Box>
          </Grid>
          <Grid item xs={12} textAlign={'center'}>
            {metrics && metrics.length > 0 ? (
              <Table
                id='project-specific-metrics-table'
                columns={columns}
                rows={metrics}
                orderBy='name'
                showCheckbox={true}
                showTopBar={true}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                topBarButtons={[
                  {
                    buttonText: strings.REMOVE,
                    buttonType: 'destructive',
                    onButtonClick: () => true,
                    icon: 'iconTrashCan',
                  },
                ]}
              />
            ) : (
              <Typography>{strings.NO_PROJECT_SPECIFIC_METRICS_TO_SHOW}</Typography>
            )}
          </Grid>
        </Grid>
        <Grid container sx={gridStyle}>
          <Grid item xs={12}>
            {title(strings.STANDARD_METRICS)}
          </Grid>
          <Grid item xs={12}>
            <Table
              id='standard-metrics-table'
              columns={columns}
              rows={standardMetrics || []}
              orderBy='name'
              showCheckbox={false}
            />
          </Grid>
        </Grid>
      </Card>
    </>
  );
}
