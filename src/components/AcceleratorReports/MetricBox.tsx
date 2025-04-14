import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Icon, Textfield, Tooltip } from '@terraware/web-components';

import Button from 'src/components/common/button/Button';
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
import { ReportBoxProps } from './ReportBox';
import ResetMetricModal from './ResetMetricModal';

export const isReportSystemMetric = (metric: any): metric is ReportSystemMetric => {
  return metric && typeof metric.metric === 'string';
};

const isStandardOrProjectMetric = (metric: any): metric is ReportStandardMetric | ReportProjectMetric => {
  return metric && typeof metric.id === 'number';
};

const statusOptions: DropdownItem[] = AcceleratorMetricStatuses.map((s) => ({
  label: s || '', // these are hardcoded, so will never actually be ''
  value: s || '',
}));

const textAreaStyles = { textarea: { height: '120px' } };

const MetricBox = ({
  editing,
  metric,
  type,
  projectId,
  reportId,
  reload,
  isConsoleView = false,
  onChangeMetric,
  onEditChange,
  canEdit,
}: {
  hideStatusBadge?: boolean;
  metric: ReportProjectMetric | ReportSystemMetric | ReportStandardMetric;
  type: MetricType;
  reportId: number;
  onChangeMetric?: (metric: ReportProjectMetric | ReportSystemMetric | ReportStandardMetric, type: MetricType) => void;
} & ReportBoxProps): JSX.Element => {
  const theme = useTheme();
  const [record, setRecord, onChange] = useForm<ReportProjectMetric | ReportSystemMetric | ReportStandardMetric>(
    metric
  );
  const [progressModalOpened, setProgressModalOpened] = useState<boolean>(false);
  const [resetMetricModalOpened, setResetMetricModalOpened] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const [internalEditing, setInternalEditing] = useState<boolean>(false);
  const [refreshRequestId, setRefreshRequestId] = useState<string>('');
  const updateReportMetricResponse = useAppSelector(selectReviewAcceleratorReportMetric(requestId));
  const refreshReportMetricResponse = useAppSelector(selectRefreshAcceleratorReportSystemMetrics(refreshRequestId));
  const snackbar = useSnackbar();

  useEffect(() => {
    if (JSON.stringify(record) !== JSON.stringify(metric)) {
      onChangeMetric?.(record, type);
    }
  }, [record]);
  useEffect(() => onEditChange?.(internalEditing), [internalEditing]);

  useEffect(() => {
    if (updateReportMetricResponse?.status === 'error') {
      snackbar.toastError();
    } else if (updateReportMetricResponse?.status === 'success') {
      setInternalEditing(false);
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      reload?.();
    }
  }, [updateReportMetricResponse, snackbar]);

  useEffect(() => {
    if (refreshReportMetricResponse?.status === 'error') {
      snackbar.toastError();
    } else if (refreshReportMetricResponse?.status === 'success') {
      setResetMetricModalOpened(false);
      setInternalEditing(false);
      if (isReportSystemMetric(metric)) {
        onChangeProgress(metric.systemValue.toString());
      }
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      reload?.();
    }
  }, [refreshReportMetricResponse, snackbar]);

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

  const isEditing = useMemo(() => editing || internalEditing, [editing, internalEditing]);

  const handleCancel = () => {
    setRecord(metric);
    setInternalEditing(false);
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
        canEdit={!!canEdit}
        onEdit={() => setInternalEditing(true)}
        onCancel={handleCancel}
        onSave={onSave}
        editing={isEditing}
        visibleToFunder={metric.isPublishable}
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
                {isEditing && metric.overrideValue && (isConsoleView || type !== 'system') && (
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
                {isEditing && (isConsoleView || type !== 'system') && (
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
                  display={!isEditing}
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
              {isEditing ? (
                <Dropdown
                  label={strings.STATUS}
                  selectedValue={record.status}
                  options={statusOptions}
                  onChange={(value: any) => onChange('status', value)}
                  disabled={!isEditing}
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
              display={!isEditing}
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
                display={!isEditing}
                styles={textAreaStyles}
                preserveNewlines
              />
              {isEditing && (
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
