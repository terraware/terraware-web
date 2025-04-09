import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Icon, Tooltip } from '@terraware/web-components';
import { Textfield } from '@terraware/web-components';

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
  AcceleratorMetricStatuses,
  MetricType,
  ReportProjectMetric,
  ReportStandardMetric,
  ReportSystemMetric,
  SystemMetricName,
} from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import EditProgressModal from './EditProgressModal';
import EditableReportBox from './EditableReportBox';
import ResetMetricModal from './ResetMetricModal';

export const isReportSystemMetric = (metric: any): metric is ReportSystemMetric => {
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

const statusOptions: DropdownItem[] = AcceleratorMetricStatuses.map((s) => ({
  label: s || '', // these are hardcoded, so will never actually be ''
  value: s || '',
}));

const textAreaStyles = { textarea: { height: '120px' } };

const MetricBox = ({
  editingId,
  setEditingId,
  metric,
  type,
  projectId,
  reportId,
  reload,
  isConsoleView = false,
  onChangeMetric,
}: {
  editingId?: string;
  hideStatusBadge?: boolean;
  projectId: string;
  reload?: () => void;
  setEditingId: (id: string | undefined) => void;
  metric: ReportProjectMetric | ReportSystemMetric | ReportStandardMetric;
  type: MetricType;
  reportId: number;
  isConsoleView?: boolean;
  onChangeMetric?: (metric: ReportProjectMetric | ReportSystemMetric | ReportStandardMetric, type: MetricType) => void;
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
    if (JSON.stringify(record) !== JSON.stringify(metric)) {
      onChangeMetric?.(record, type);
    }
  }, [record]);

  useEffect(() => {
    if (updateReportMetricResponse?.status === 'error') {
      snackbar.toastError();
    } else if (updateReportMetricResponse?.status === 'success') {
      setEditingId(undefined);
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      reload?.();
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
      reload?.();
    }
  }, [refreshReportMetricResponse, snackbar]);

  const editing = useMemo(() => editingId === getMetricId(metric, type), [editingId, metric, getMetricId]);

  const onEditItem = useCallback(() => {
    setEditingId(getMetricId(metric, type));
  }, [setEditingId, metric, getMetricId]);

  const getUpdateBody = () => {
    const baseMetric = {
      underperformanceJustification: record.underperformanceJustification,
      progressNotes: record.progressNotes,
      status: record.status,
    };
    if (type === 'system' && isReportSystemMetric(record)) {
      return {
        systemMetrics: [
          {
            metric: record.metric as SystemMetricName,
            overrideValue: record.overrideValue,
            ...baseMetric,
          },
        ],
        projectMetrics: [],
        standardMetrics: [],
      };
    } else if (type === 'standard' && isStandardOrProjectMetric(record)) {
      return {
        standardMetrics: [
          {
            id: record.id,
            value: record.value,
            ...baseMetric,
          },
        ],
        systemMetrics: [],
        projectMetrics: [],
      };
    } else if (type === 'project' && isStandardOrProjectMetric(record)) {
      return {
        projectMetrics: [
          {
            id: record.id,
            value: record.value,
            ...baseMetric,
          },
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
      <EditableReportBox
        name={getMetricName()}
        canEdit={isAllowed('EDIT_REPORTS')}
        onEdit={onEditItem}
        onCancel={handleCancel}
        onSave={onSave}
        editing={editing}
        isConsoleView={isConsoleView}
        description={metric?.description}
      >
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
                {!!editing && metric.overrideValue && (isConsoleView || type !== 'system') && (
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
                {!!editing && (isConsoleView || type !== 'system') && (
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
                <Textfield
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
              {editing ? (
                <Dropdown
                  label={strings.STATUS}
                  selectedValue={record.status}
                  options={statusOptions}
                  onChange={(value: any) => onChange('status', value)}
                  disabled={!editing}
                  placeholder={'No Status'}
                />
              ) : (
                <>
                  <Typography sx={{ color: theme.palette.TwClrTxtSecondary, fontSize: '14px', marginBottom: '12px' }}>
                    {strings.STATUS}
                  </Typography>
                  <Typography sx={{ fontWeight: '500' }}>{record.status}</Typography>
                </>
              )}
            </Box>
          </Grid>
        )}
        <Grid item xs={6}>
          <Box paddingRight={theme.spacing(2)}>
            <Textfield
              type='textarea'
              label={strings.UNDERPERFORMANCE_JUSTIFICATION}
              value={record.underperformanceJustification}
              id={'underperformanceJustification'}
              onChange={(value: any) => onChange('underperformanceJustification', value)}
              display={!editing}
              styles={textAreaStyles}
              preserveNewlines
            />
          </Box>
        </Grid>
        {isConsoleView && (
          <Grid item xs={6}>
            <Box paddingRight={theme.spacing(2)}>
              <Textfield
                type='textarea'
                label={strings.PROGRESS_NOTES}
                value={record.progressNotes}
                id={'progressNotes'}
                onChange={(value: any) => onChange('progressNotes', value)}
                display={!editing}
                styles={textAreaStyles}
                preserveNewlines
              />
              {!!editing && (
                <Typography fontSize={14} color={theme.palette.TwClrTxtSecondary}>
                  {strings.PROGRESS_NOTES_DESCRIPTION}
                </Typography>
              )}
            </Box>
          </Grid>
        )}
      </EditableReportBox>
    </>
  );
};

export default MetricBox;
