import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, TableColumnType, Textfield } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import Table from 'src/components/common/table';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useUser } from 'src/providers';
import {
  selectListReportMetrics,
  selectListStandardMetrics,
  selectListSystemMetrics,
  selectProjectReportConfig,
} from 'src/redux/features/reports/reportsSelectors';
import {
  requestListProjectMetrics,
  requestListStandardMetrics,
  requestListSystemMetrics,
  requestProjectReportConfig,
} from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ProjectMetric, StandardMetric, SystemMetric } from 'src/types/AcceleratorReport';

import EditMetricModal from './EditMetricModal';
import SpecificMetricsRenderer from './SpecificMetricsRenderer';
import SystemMetricsRenderer from './SystemMetricsRenderer';

export default function ReportsSettings(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = String(pathParams.projectId);
  const projectReportConfig = useAppSelector((state) => selectProjectReportConfig(state));
  const dispatch = useAppDispatch();
  const { goToAcceleratorEditReportSettings, goToNewProjectMetric } = useNavigateTo();
  const [requestId, setRequestId] = useState<string>('');
  const [standardRequestId, setStandardRequestId] = useState<string>('');
  const [systemRequestId, setSystemRequestId] = useState<string>('');
  const specificMetricsResponse = useAppSelector(selectListReportMetrics(requestId));
  const standardMetricsResponse = useAppSelector(selectListStandardMetrics(standardRequestId));
  const systemMetricsResponse = useAppSelector(selectListSystemMetrics(systemRequestId));
  const [metrics, setMetrics] = useState<ProjectMetric[]>();
  const [standardMetrics, setStandardMetrics] = useState<StandardMetric[]>();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>();
  const [selectedRows, setSelectedRows] = useState<ProjectMetric[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<ProjectMetric>();
  const [editMetricModalOpened, setEditMetricModalOpened] = useState<boolean>(false);
  const { isAllowed } = useUser();

  useEffect(() => {
    const dispatched = dispatch(requestListStandardMetrics());
    setStandardRequestId(dispatched.requestId);
  }, []);

  useEffect(() => {
    const dispatched = dispatch(requestListSystemMetrics());
    setSystemRequestId(dispatched.requestId);
  }, []);

  const reloadSpecificMetrics = () => {
    const dispatched = dispatch(requestListProjectMetrics({ projectId }));
    setRequestId(dispatched.requestId);
  };

  useEffect(() => {
    reloadSpecificMetrics();
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

  useEffect(() => {
    if (systemMetricsResponse && systemMetricsResponse.status === 'success') {
      setSystemMetrics(systemMetricsResponse.data);
    }
  }, [systemMetricsResponse]);

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
    {
      key: 'isPublishable',
      name: strings.PUBLISH,
      type: 'boolean',
    },
  ];

  const onRowClick = (metric: ProjectMetric) => {
    setSelectedMetric(metric);
    setEditMetricModalOpened(true);
  };

  return (
    <>
      {editMetricModalOpened && selectedMetric && (
        <EditMetricModal
          onClose={() => setEditMetricModalOpened(false)}
          projectMetric={selectedMetric}
          reload={reloadSpecificMetrics}
        />
      )}
      <Card
        style={{ display: 'flex', flexDirection: 'column' }}
        title={strings.SETTINGS}
        rightComponent={
          isAllowed('UPDATE_REPORTS_SETTINGS') && (
            <Button icon='iconEdit' onClick={goToEditSettings} priority='secondary' />
          )
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
          <Grid item xs={gridSize} marginTop={2}>
            <Box>
              <Typography
                fontSize={'14px'}
                color={theme.palette.TwClrTxtSecondary}
                paddingBottom={'12px'}
                lineHeight={'20px'}
              >
                {strings.LOG_FRAME_AND_ME_PLAN_URL}
              </Typography>
              <Link to={projectReportConfig.config?.logframeUrl} target='_blank' fontSize={'16px'}>
                {projectReportConfig.config?.logframeUrl}
              </Link>
            </Box>
          </Grid>
        </Grid>
        <Grid container sx={gridStyle}>
          <Grid item xs={12} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
            {title(strings.PROJECT_SPECIFIC_METRICS)}
            {isAllowed('UPDATE_REPORTS_SETTINGS') && (
              <Box>
                <Button
                  label={strings.ADD_METRIC}
                  icon='plus'
                  onClick={() => goToNewProjectMetric(projectId)}
                  priority='secondary'
                />
              </Box>
            )}
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
                Renderer={SpecificMetricsRenderer}
                onSelect={onRowClick}
                controlledOnSelect={true}
                isClickable={() => false}
              />
            ) : (
              <Typography>{strings.NO_PROJECT_SPECIFIC_METRICS_TO_SHOW}</Typography>
            )}
          </Grid>
        </Grid>
        <Grid container sx={gridStyle}>
          <Grid item xs={12}>
            {title(strings.SYSTEM_METRICS)}
          </Grid>
          <Grid item xs={12}>
            <Table
              id='system-metrics-table'
              columns={columns}
              rows={systemMetrics || []}
              orderBy='name'
              showCheckbox={false}
              Renderer={SystemMetricsRenderer}
            />
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
