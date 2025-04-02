import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Icon, Tooltip } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import Button from 'src/components/common/button/Button';
import { useUser } from 'src/providers';
import {
  selectRefreshAcceleratorReportSystemMetrics,
  selectReviewAcceleratorReportMetric,
} from 'src/redux/features/reports/reportsSelectors';
import {
  requestRefreshAcceleratorReportSystemMetrics,
  requestReviewAcceleratorReportMetric,
} from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import {
  MetricType,
  ReportProjectMetric,
  ReportStandardMetric,
  ReportSystemMetric,
  SystemMetricName,
} from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import EditProgressModal from './EditProgressModal';
import ResetMetricModal from './ResetMetricModal';

const isReportSystemMetric = (metric: any): metric is ReportSystemMetric => {
  return metric && typeof metric.metric === 'string';
};

const isStandardOrProjectMetric = (metric: any): metric is ReportStandardMetric | ReportProjectMetric => {
  return metric && typeof metric.id === 'number';
};

export const getMetricId = (
  metric: ReportProjectMetric | ReportSystemMetric | ReportStandardMetric,
  type: MetricType
) => {
  if (isReportSystemMetric(metric)) {
    return metric.metric.replace(/\s+/g, '');
  } else if (isStandardOrProjectMetric(metric)) {
    if (type === 'project') {
      return `p${metric.id}`;
    } else {
      return `s${metric.id}`;
    }
  }
  return '-1';
};

const MetricBox = ({
  editingId,
  index,
  setEditingId,
  showEditOnHover = true,
  metric,
  type,
  projectId,
  reportId,
  reload,
  isConsoleView = false,
}: {
  editingId?: string;
  hideStatusBadge?: boolean;
  index: number;
  projectId: string;
  reload: () => void;
  setEditingId: (id: string | undefined) => void;
  showEditOnHover?: boolean;
  metric: ReportProjectMetric | ReportSystemMetric | ReportStandardMetric;
  type: MetricType;
  reportId: number;
  isConsoleView?: boolean;
}): JSX.Element => {
  const theme = useTheme();
  const [record, setRecord, onChange] = useForm<ReportProjectMetric | ReportSystemMetric | ReportStandardMetric>(
    metric
  );
  const [progressModalOpened, setProgressModalOpened] = useState<boolean>(false);
  const [resetMetricModalOpened, setResetMetricModalOpened] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const [refreshRequestId, setRefreshRequestId] = useState<string>('');
  const updateReportMetricResponse = useAppSelector(selectReviewAcceleratorReportMetric(requestId));
  const refreshReportMetricResponse = useAppSelector(selectRefreshAcceleratorReportSystemMetrics(refreshRequestId));
  const { isAllowed } = useUser();
  const snackbar = useSnackbar();

  useEffect(() => {
    if (updateReportMetricResponse?.status === 'error') {
      snackbar.toastError();
    } else if (updateReportMetricResponse?.status === 'success') {
      setEditingId(undefined);
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      reload();
    }
  }, [updateReportMetricResponse, snackbar]);

  useEffect(() => {
    if (refreshReportMetricResponse?.status === 'error') {
      snackbar.toastError();
    } else if (refreshReportMetricResponse?.status === 'success') {
      setResetMetricModalOpened(false);
      setEditingId(undefined);
      if (isReportSystemMetric(metric)) {
        onChangeProgress(metric.systemValue.toString());
      }
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      reload();
    }
  }, [refreshReportMetricResponse, snackbar]);

  const editing = useMemo(() => editingId === getMetricId(metric, type), [editingId, metric, getMetricId]);

  const onEditItem = useCallback(() => {
    setEditingId(getMetricId(metric, type));
  }, [setEditingId, metric, getMetricId]);

  const getUpdateBody = () => {
    if (type === 'system' && isReportSystemMetric(record)) {
      return {
        systemMetrics: [
          {
            metric: record.metric as SystemMetricName,
            overrideValue: record.overrideValue,
            underperformanceJustification: record.underperformanceJustification,
          },
        ],
        projectMetrics: [],
        standardMetrics: [],
      };
    } else if (type === 'standard' && isStandardOrProjectMetric(record)) {
      return {
        standardMetrics: [
          { id: record.id, value: record.value, underperformanceJustification: record.underperformanceJustification },
        ],
        systemMetrics: [],
        projectMetrics: [],
      };
    } else if (type === 'project' && isStandardOrProjectMetric(record)) {
      return {
        projectMetrics: [
          { id: record.id, value: record.value, underperformanceJustification: record.underperformanceJustification },
        ],
        standardMetrics: [],
        systemMetrics: [],
      };
    }
    return {
      systemMetrics: [],
      projectMetrics: [],
      standardMetrics: [],
    };
  };

  const onSave = useCallback(() => {
    const request = dispatch(
      requestReviewAcceleratorReportMetric({
        metric: getUpdateBody(),
        projectId: Number(projectId),
        reportId: reportId,
      })
    );
    setRequestId(request.requestId);
  }, [dispatch, projectId, reportId, record]);

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

  const onResetMetricHandler = () => {
    if (isReportSystemMetric(metric)) {
      const request = dispatch(
        requestRefreshAcceleratorReportSystemMetrics({
          reportId,
          projectId: Number(projectId),
          metricName: metric.metric,
        })
      );
      setRefreshRequestId(request.requestId);
    }
  };

  const handleCancel = () => {
    setRecord(metric);
    setEditingId(undefined);
  };

  return (
    <>
      {progressModalOpened && (
        <EditProgressModal
          metricName={getMetricName()}
          target={metric.target || 0}
          onChange={onChangeProgress}
          value={getProgressValue()}
          onClose={() => setProgressModalOpened(false)}
        />
      )}
      {resetMetricModalOpened && (
        <ResetMetricModal onClose={() => setResetMetricModalOpened(false)} onSubmit={onResetMetricHandler} />
      )}
      <Box data-metric-id={getMetricId(metric, type)} key={`metric-${index}`} sx={{ scrollMarginTop: '50vh' }}>
        <Box
          sx={{
            borderRadius: 2,
            '&:hover': {
              background:
                !showEditOnHover || !isAllowed('UPDATE_REPORTS_SETTINGS')
                  ? 'none'
                  : editing
                    ? theme.palette.TwClrBgActive
                    : theme.palette.TwClrBgHover,
              '.actions': {
                display: showEditOnHover && isAllowed('UPDATE_REPORTS_SETTINGS') ? 'block' : 'none',
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
              {isStandardOrProjectMetric(metric) && <Typography sx={{ fontWeight: '600' }}>{metric.name}</Typography>}
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
              {isReportSystemMetric(metric) ? (
                <>
                  <Typography fontSize={'14px'} color={theme.palette.TwClrTxtSecondary}>
                    {strings.PROGRESS} *
                  </Typography>
                  <Box display={'flex'} alignItems={'center'} paddingTop={1.5} paddingBottom={theme.spacing(2)}>
                    <Typography>
                      {getProgressValue() || 0} / {record.target} ({strings.TARGET})
                    </Typography>
                    {!metric.overrideValue && (
                      <Box paddingTop={1} paddingLeft={1.5}>
                        <Tooltip title={strings.TERRAWARE_METRIC_MESSAGE}>
                          <Icon name='iconDataMigration' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
                        </Tooltip>
                      </Box>
                    )}
                    {!!editing && metric.overrideValue && (
                      <Button
                        icon='iconUndo'
                        onClick={() => setResetMetricModalOpened(true)}
                        priority='ghost'
                        size='small'
                        type='passive'
                        style={{
                          marginLeft: '-1px',
                          marginTop: '-1px',
                        }}
                      />
                    )}
                    {!!editing && (
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
                    )}
                  </Box>

                  {metric.overrideValue && (
                    <Typography fontSize={'14px'} color={theme.palette.TwClrTxtSecondary} paddingTop={1.5}>
                      {strings.formatString(strings.OVERWRITTEN_ORIGINAL_VALUE, metric.systemValue)}
                    </Typography>
                  )}
                </>
              ) : (
                isStandardOrProjectMetric(record) && (
                  <Box display={'flex'} alignItems={'center'} paddingBottom={theme.spacing(2)}>
                    <TextField
                      type='text'
                      label={strings.PROGRESS}
                      value={record.value}
                      id={'value'}
                      onChange={(value: any) => onChange('value', value)}
                      display={!editing}
                      required={true}
                    />
                    <Typography paddingTop={3} paddingLeft={0.5}>
                      / {record.target} ({strings.TARGET})
                    </Typography>
                  </Box>
                )
              )}
            </Grid>
            {isConsoleView && (
              <Grid item xs={6}>
                <Box>
                  <TextField
                    type='textarea'
                    label={strings.STATUS}
                    value={record.status}
                    id={'status'}
                    onChange={(value: any) => onChange('status', value)}
                    display={!editing}
                  />
                </Box>
              </Grid>
            )}
            <Grid item xs={6}>
              <Box paddingRight={theme.spacing(2)}>
                <TextField
                  type='textarea'
                  label={strings.UNDERPERFORMANCE_JUSTIFICATION}
                  value={record.underperformanceJustification}
                  id={'underperformanceJustification'}
                  onChange={(value: any) => onChange('underperformanceJustification', value)}
                  display={!editing}
                  preserveNewlines
                />
                {!!editing && (
                  <Typography fontSize={14} color={theme.palette.TwClrTxtSecondary}>
                    {strings.UNDERPERFORMANCE_DESCRIPTION}
                  </Typography>
                )}
              </Box>
            </Grid>
            {isConsoleView && (
              <Grid item xs={6}>
                <Box paddingRight={theme.spacing(2)}>
                  <TextField
                    type='textarea'
                    label={strings.PROGRESS_NOTES}
                    value={record.progressNotes}
                    id={'progressNotes'}
                    onChange={(value: any) => onChange('progressNotes', value)}
                    display={!editing}
                    preserveNewlines
                  />
                  {!!editing && (
                    <Typography fontSize={14} color={theme.palette.TwClrTxtSecondary}>
                      {strings.UNDERPERFORMANCE_DESCRIPTION}
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>

          {editing && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                id='cancel'
                label={strings.CANCEL}
                type='passive'
                onClick={handleCancel}
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
