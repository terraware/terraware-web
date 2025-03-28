import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import Button from 'src/components/common/button/Button';
import { selectReviewAcceleratorReportMetric } from 'src/redux/features/reports/reportsSelectors';
import { requestReviewAcceleratorReportMetric } from 'src/redux/features/reports/reportsThunks';
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
  metric,
  type,
  projectId,
  reportId,
}: {
  editingId?: string;
  hideStatusBadge?: boolean;
  index: number;
  projectId: string;
  reload: () => void;
  setEditingId: (id: string | undefined) => void;
  metric: ReportProjectMetric | ReportSystemMetric | ReportStandardMetric;
  type: MetricType;
  reportId: number;
}): JSX.Element => {
  const theme = useTheme();
  const [record, , onChange] = useForm<ReportProjectMetric | ReportSystemMetric | ReportStandardMetric>(metric);
  const [progressModalOpened, setProgressModalOpened] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const updateReportMetricResponse = useAppSelector(selectReviewAcceleratorReportMetric(requestId));
  const snackbar = useSnackbar();

  useEffect(() => {
    if (updateReportMetricResponse?.status === 'error') {
      snackbar.toastError();
    } else if (updateReportMetricResponse?.status === 'success') {
      setEditingId(undefined);
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    }
  }, [updateReportMetricResponse, snackbar]);

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
      {progressModalOpened && (
        <EditProgressModal
          metricName={getMetricName()}
          target={metric.target || 0}
          onChange={onChangeProgress}
          value={getProgressValue()}
          onClose={() => setProgressModalOpened(false)}
        />
      )}
      <Box data-metric-id={getMetricId(metric, type)} key={`metric-${index}`} sx={{ scrollMarginTop: '50vh' }}>
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
              <Box display={'flex'} alignItems={'center'}>
                <Typography>
                  {getProgressValue() || 0} / {record.target} ({strings.TARGET})
                </Typography>
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
