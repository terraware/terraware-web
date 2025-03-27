import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import {
  selectListReportMetrics,
  selectListStandardMetrics,
  selectListSystemMetrics,
} from 'src/redux/features/reports/reportsSelectors';
import {
  requestListProjectMetrics,
  requestListStandardMetrics,
  requestListSystemMetrics,
} from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import {
  MetricType,
  ProjectMetric,
  ReportProjectMetric,
  ReportStandardMetric,
  ReportSystemMetric,
  StandardMetric,
  SystemMetric,
} from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import EditProgressModal from './EditProgressModal';

const isReportSystemMetric = (metric: any): metric is ReportSystemMetric => {
  return metric && typeof metric.metric === 'string';
};

const isStandardOrProjectMetric = (metric: any): metric is ReportStandardMetric | ReportProjectMetric => {
  return metric && typeof metric.id === 'number';
};

export const getMetricId = (metric: ReportProjectMetric | ReportSystemMetric | ReportStandardMetric) => {
  if (isReportSystemMetric(metric)) {
    return metric.metric.replace(/\s+/g, '');
  } else if (isStandardOrProjectMetric(metric)) {
    return metric.id.toString();
  }
  return '-1';
};

const MetricBox = ({
  editingId,
  index,
  projectId,
  reload,
  setEditingId,
  setUpdatePendingId,
  metric,
  type,
}: {
  editingId?: string;
  hideStatusBadge?: boolean;
  index: number;
  projectId: string;
  reload: () => void;
  setEditingId: (id: string | undefined) => void;
  setUpdatePendingId: (variableId: number | undefined) => void;
  metric: ReportProjectMetric | ReportSystemMetric | ReportStandardMetric;
  type: MetricType;
}): JSX.Element => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const snackbar = useSnackbar();
  const [record, setRecord, onChange] = useForm<ReportProjectMetric | ReportSystemMetric | ReportStandardMetric>(
    metric
  );
  const [requestId, setRequestId] = useState<string>('');
  const [standardRequestId, setStandardRequestId] = useState<string>('');
  const dispatch = useAppDispatch();
  const projectMetricsResponse = useAppSelector(selectListReportMetrics(requestId));
  const systemMetricsResponse = useAppSelector(selectListSystemMetrics(requestId));
  const standardMetricsResponse = useAppSelector(selectListStandardMetrics(standardRequestId));
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetric[]>();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>();
  const [standardMetrics, setStandardMetrics] = useState<StandardMetric[]>();
  const [metricData, setMetricData] = useState<ProjectMetric | SystemMetric | StandardMetric>();
  const [progressModalOpened, setProgressModalOpened] = useState<boolean>(false);

  useEffect(() => {
    if (isStandardOrProjectMetric(metric)) {
      const request = dispatch(requestListProjectMetrics({ projectId }));
      setRequestId(request.requestId);
      const request2 = dispatch(requestListStandardMetrics());
      setStandardRequestId(request2.requestId);
    }
    if (isReportSystemMetric(metric)) {
      const request = dispatch(requestListSystemMetrics());
      setRequestId(request.requestId);
    }
  }, [metric]);

  useEffect(() => {
    if (projectMetricsResponse?.status === 'error') {
      return;
    }
    if (projectMetricsResponse?.data) {
      setProjectMetrics(projectMetricsResponse.data);
    }
  }, [projectMetricsResponse]);

  useEffect(() => {
    if (systemMetricsResponse?.status === 'error') {
      return;
    }
    if (systemMetricsResponse?.data) {
      setSystemMetrics(systemMetricsResponse.data);
    }
  }, [systemMetricsResponse]);

  useEffect(() => {
    if (standardMetricsResponse?.status === 'error') {
      return;
    }
    if (standardMetricsResponse?.data) {
      setStandardMetrics(standardMetricsResponse.data);
    }
  }, [standardMetricsResponse]);

  useEffect(() => {
    if (isReportSystemMetric(metric)) {
      const found = systemMetrics?.find((sm) => sm.metric === metric.metric);
      setMetricData(found);
    }
    if (isStandardOrProjectMetric(metric)) {
      let found = standardMetrics?.find((sm) => sm.id === metric.id);
      if (!found) {
        found = projectMetrics?.find((sm) => sm.id === metric.id);
      }
      setMetricData(found);
    }
  }, [projectMetrics, systemMetrics, standardMetrics, metric]);

  const editing = useMemo(() => editingId === getMetricId(metric), [editingId, metric, getMetricId]);

  const onEditItem = useCallback(() => {
    setEditingId(getMetricId(metric));
  }, [setEditingId, metric, getMetricId]);

  const onSave = useCallback(() => {
    return true;
  }, []);

  const onChangeProgress = (newValue: string) => {
    if (isStandardOrProjectMetric(record)) {
      onChange('value', newValue);
    } else {
      onChange('overrideValue', newValue);
    }
  };

  const getProgressValue = () => {
    if (isStandardOrProjectMetric(record)) {
      return record.value;
    } else {
      return record.overrideValue || record.systemValue;
    }
  };

  const getMetricName = () => {
    if (isStandardOrProjectMetric(metric)) {
      return metric.name;
    } else {
      return metric.metric;
    }
  };

  return (
    <>
      {progressModalOpened && metric.target && (
        <EditProgressModal
          metricName={getMetricName()}
          target={metric.target}
          onChange={onChangeProgress}
          value={getProgressValue()}
          onClose={() => setProgressModalOpened(false)}
        />
      )}
      <Box data-metric-id={getMetricId(metric)} key={`metric-${index}`} sx={{ scrollMarginTop: '50vh' }}>
        <Box
          sx={{
            borderRadius: 2,
            '&:hover': {
              background: editing ? theme.palette.TwClrBgActive : theme.palette.TwClrBgHover,
              '.actions': {
                display: 'block',
              },
            },
            background: editing ? theme.palette.TwClrBgActive : 'none',
            '& .actions': {
              display: 'none',
            },
            marginBottom: theme.spacing(4),
            padding: 2,
            width: '100%',
          }}
        >
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-apart',
              marginBottom: '16px',
              width: '100%',
            }}
          >
            <Box
              sx={{
                alignItems: 'start',
                display: 'flex',
                flexGrow: 1,
                justifyContent: 'flex-start',
                flexDirection: 'column',
              }}
            >
              {isReportSystemMetric(metric) && <Typography sx={{ fontWeight: '600' }}>{metric.metric}</Typography>}
              {isStandardOrProjectMetric(metric) && <Typography sx={{ fontWeight: '600' }}>{metric.id}</Typography>}
            </Box>

            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                flexGrow: 1,
                justifyContent: 'flex-end',
              }}
            >
              {!editingId && (
                <Box className='actions'>
                  <Button
                    id='edit'
                    label={strings.EDIT}
                    onClick={onEditItem}
                    icon='iconEdit'
                    priority='secondary'
                    className='edit-button'
                    size='small'
                    sx={{ '&.button': { margin: '4px' } }}
                    type='passive'
                  />
                </Box>
              )}
            </Box>
          </Box>

          {!!metric.description && (
            <Typography
              sx={{
                color: 'rgba(0, 0, 0, 0.54)',
                fontSize: '14px',
                fontStyle: 'italic',
                lineHeight: '20px',
                marginY: '16px',
              }}
            >
              {metric?.description}
            </Typography>
          )}

          <Grid container marginBottom={3}>
            <Grid item xs={6}>
              <Box display={'flex'} alignItems={'center'}>
                <Typography paddingTop={3}>
                  {getProgressValue()} / {record.target} ({strings.TARGET})
                </Typography>
                <Button
                  icon='iconEdit'
                  onClick={() => setProgressModalOpened(true)}
                  priority='ghost'
                  size='small'
                  type='passive'
                  style={{
                    marginLeft: '-1px',
                    marginTop: '-1px',
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <TextField
                  type='textarea'
                  label={strings.NOTES}
                  value={record.underperformanceJustification}
                  id={'underperformanceJustification'}
                  onChange={(value: any) => onChange('underperformanceJustification', value)}
                  display={!editing}
                />
                {!!editing && (
                  <Typography fontSize={14} color={theme.palette.TwClrTxtSecondary}>
                    {strings.UNDERPERFORMANCE_DESCRIPTION}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {editing && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                id='cancel'
                label={strings.CANCEL}
                type='passive'
                onClick={() => setEditingId(undefined)}
                priority='secondary'
                key='button-1'
              />
              <Button id={'save'} onClick={onSave} label={strings.SAVE} key='button-2' priority='secondary' />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default MetricBox;
