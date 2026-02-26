import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Box, Collapse, Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Icon, Textfield } from '@terraware/web-components';

import MetricStatusBadge from 'src/components/AcceleratorReports/MetricStatusBadge';
import ProgressChart from 'src/components/common/Chart/ProgressChart';
import Button from 'src/components/common/button/Button';
import useBoolean from 'src/hooks/useBoolean';
import { useLocalization } from 'src/providers';
import {
  ReportProjectMetricPayload,
  ReportStandardMetricPayload,
  ReportSystemMetricPayload,
  useReviewAcceleratorReportMetricsMutation,
} from 'src/queries/generated/reports';
import { AcceleratorMetricStatuses, MetricType } from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

export const isReportSystemMetric = (metric: any): metric is ReportSystemMetricPayload => {
  return metric && typeof metric.metric === 'string';
};

const isStandardOrProjectMetric = (metric: any): metric is ReportStandardMetricPayload | ReportProjectMetricPayload => {
  return metric && typeof metric.id === 'number';
};

const statusOptions: DropdownItem[] = AcceleratorMetricStatuses.map((status) => ({
  label: status || '',
  value: status || '',
}));

const textAreaStyles = { textarea: { height: '120px' } };

type MetricRowProps = {
  metric: ReportProjectMetricPayload | ReportSystemMetricPayload | ReportStandardMetricPayload;
  type: MetricType;
  reportLabel?: string;
  year?: number;
  projectId: number;
  reportId: number;
  canEdit?: boolean;
  onEditChange?: (editing: boolean) => void;
};

const MetricRow = ({
  metric,
  type,
  reportLabel = '',
  year,
  projectId,
  reportId,
  canEdit,
  onEditChange,
}: MetricRowProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const [expanded, setExpanded] = useState(false);
  const [record, setRecord, , onChangeCallback] = useForm<
    ReportProjectMetricPayload | ReportSystemMetricPayload | ReportStandardMetricPayload
  >(metric);
  const [internalEditing, setInternalEditing, setInternalEditingTrue, setInternalEditingFalse] = useBoolean(false);

  const [reviewReportMetrics, reviewReportMetricResponse] = useReviewAcceleratorReportMetricsMutation();
  const snackbar = useSnackbar();

  useEffect(() => onEditChange?.(internalEditing), [internalEditing, onEditChange]);

  useEffect(() => {
    if (reviewReportMetricResponse.isError) {
      snackbar.toastError();
    } else if (reviewReportMetricResponse.isSuccess) {
      setInternalEditing(false);
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    }
  }, [snackbar, setInternalEditing, strings, reviewReportMetricResponse.isError, reviewReportMetricResponse.isSuccess]);

  useEffect(() => {
    if (!internalEditing) {
      setRecord(metric);
    }
  }, [internalEditing, metric, setRecord]);

  const getMetricName = () => {
    if (isStandardOrProjectMetric(metric)) {
      return metric.name;
    } else {
      return metric.metric;
    }
  };

  const getActualValue = () => {
    if (isStandardOrProjectMetric(record)) {
      return record.value || 0;
    } else {
      return record.overrideValue || record.systemValue || 0;
    }
  };

  const getUnit = () => {
    if (isStandardOrProjectMetric(metric) && 'unit' in metric) {
      return metric.unit;
    }
    return '';
  };

  const targetValue = metric.target || 0;
  const actualValue = getActualValue();
  const percentComplete = targetValue > 0 ? Math.round((actualValue / targetValue) * 100) : 0;

  const hasComments = !!metric.projectsComments || !!metric.progressNotes;

  const onToggle = useCallback(() => {
    if (!internalEditing && hasComments) {
      setExpanded((prev) => !prev);
    }
  }, [hasComments, internalEditing]);

  const getUpdateBody = useCallback(() => {
    const baseMetric = {
      projectsComments: record.projectsComments,
      progressNotes: record.progressNotes,
      status: record.status,
    };
    if (type === 'system' && isReportSystemMetric(record)) {
      return {
        systemMetrics: [{ ...record, metric: record.metric, overrideValue: record.overrideValue, ...baseMetric }],
        projectMetrics: [],
        standardMetrics: [],
      };
    } else if (type === 'standard' && isStandardOrProjectMetric(record)) {
      return {
        standardMetrics: [{ ...record, id: record.id, value: record.value, ...baseMetric }],
        systemMetrics: [],
        projectMetrics: [],
      };
    } else if (type === 'project' && isStandardOrProjectMetric(record)) {
      return {
        projectMetrics: [{ ...record, id: record.id, value: record.value, ...baseMetric }],
        standardMetrics: [],
        systemMetrics: [],
      };
    }
    return { systemMetrics: [], projectMetrics: [], standardMetrics: [] };
  }, [record, type]);

  const onSave = useCallback(() => {
    void reviewReportMetrics({
      projectId,
      reportId,
      reviewAcceleratorReportMetricsRequestPayload: getUpdateBody(),
    });
  }, [getUpdateBody, projectId, reportId, reviewReportMetrics]);

  const handleCancel = useCallback(() => {
    setRecord(metric);
    setInternalEditingFalse();
  }, [metric, setInternalEditingFalse, setRecord]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const unit = getUnit();
  const actualValueLabel = `${reportLabel} ${strings.ACTUAL}${unit ? ` (${unit})` : ''}`;

  const renderActualValueInput = () => {
    if (isReportSystemMetric(record)) {
      return (
        <Textfield
          type='number'
          label={actualValueLabel}
          value={record.overrideValue ?? record.systemValue}
          id='overrideValue'
          onChange={onChangeCallback('overrideValue')}
          display={false}
          required={true}
          min={0}
        />
      );
    }
    if (isStandardOrProjectMetric(record)) {
      return (
        <Textfield
          type='number'
          label={actualValueLabel}
          value={record.value}
          id='value'
          onChange={onChangeCallback('value')}
          display={false}
          required={true}
          min={0}
        />
      );
    }
    return null;
  };

  return (
    <Box>
      <Box
        sx={{
          background: internalEditing ? theme.palette.TwClrBgActive : 'none',
          '&:hover': {
            background: internalEditing
              ? theme.palette.TwClrBgActive
              : canEdit || hasComments
                ? theme.palette.TwClrBaseGray025
                : 'none',
            '.actions': { visibility: canEdit && !internalEditing ? 'visible' : 'hidden' },
          },
          '& .actions': { visibility: 'hidden' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(2, 3),
            cursor: !internalEditing && hasComments ? 'pointer' : 'default',
          }}
          onClick={onToggle}
        >
          <Box flex={3} paddingRight={2}>
            <Typography fontSize='16px' fontWeight={600} marginBottom={internalEditing ? 0 : 1}>
              {getMetricName()}
            </Typography>
            {!internalEditing && (
              <Box>
                <Box display='flex' gap={1} marginBottom={0.5}>
                  <Typography fontSize='12px' color={theme.palette.TwClrTxtSecondary}>
                    {reportLabel}
                  </Typography>
                </Box>
                {/* TODO: Show values from other quarters and annual target */}
                <ProgressChart value={actualValue} target={targetValue} />
              </Box>
            )}
          </Box>

          <Divider orientation='vertical' flexItem sx={{ marginX: 2 }} />

          <Box flex={1} paddingX={2}>
            {internalEditing ? (
              renderActualValueInput()
            ) : (
              <>
                <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} marginBottom={0.5}>
                  {reportLabel} {strings.ACTUAL}
                </Typography>
                <Typography fontSize='20px' fontWeight={600}>
                  {actualValue} {unit}
                </Typography>
              </>
            )}
          </Box>

          <Divider orientation='vertical' flexItem sx={{ marginX: 2 }} />

          <Box flex={1} paddingX={2}>
            <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} marginBottom={0.5}>
              {year} {strings.TARGET}
            </Typography>
            <Typography fontSize='20px' fontWeight={600}>
              {targetValue} {unit}
            </Typography>
          </Box>

          <Divider orientation='vertical' flexItem sx={{ marginX: 2 }} />

          <Box flex={1} paddingX={2}>
            <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} marginBottom={0.5}>
              % {strings.COMPLETE}
            </Typography>
            <Typography fontSize='20px' fontWeight={600}>
              {percentComplete}%
            </Typography>
          </Box>

          <Divider orientation='vertical' flexItem sx={{ marginX: 2 }} />

          <Box flex={1} paddingX={2}>
            {internalEditing ? (
              <Dropdown
                label={strings.STATUS}
                selectedValue={record.status}
                options={statusOptions}
                onChange={onChangeCallback('status')}
                placeholder='No Status'
              />
            ) : (
              <>
                <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} marginBottom={0.5}>
                  {strings.STATUS}
                </Typography>
                {metric.status && <MetricStatusBadge status={metric.status} />}
              </>
            )}
          </Box>

          {!internalEditing && (
            <Box className='actions' alignItems='center' onClick={handleEditClick} sx={{ marginLeft: 1 }}>
              <Button
                id='edit'
                label={strings.EDIT}
                onClick={setInternalEditingTrue}
                icon='iconEdit'
                priority='secondary'
                size='small'
                type='passive'
                sx={{ '&.button': { margin: '4px' } }}
              />
            </Box>
          )}

          {!internalEditing && (
            <IconButton size='small' sx={{ marginLeft: 1, visibility: hasComments ? 'visible' : 'hidden' }}>
              <Icon
                name={expanded ? 'chevronUp' : 'chevronDown'}
                size='medium'
                fillColor={theme.palette.TwClrIcnSecondary}
              />
            </IconButton>
          )}
        </Box>

        <Collapse in={internalEditing || (hasComments && expanded)} unmountOnExit>
          <Box padding={theme.spacing(0, 3, 3, 3)}>
            {internalEditing ? (
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Box sx={{ '.markdown a': { wordBreak: 'break-word' } }}>
                    <Textfield
                      type='textarea'
                      label={strings.PROJECTS_COMMENTS}
                      value={record.projectsComments}
                      id='projectsComments'
                      onChange={onChangeCallback('projectsComments')}
                      display={false}
                      styles={textAreaStyles}
                      preserveNewlines
                      markdown
                    />
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box>
                    <Textfield
                      type='textarea'
                      label={strings.PROGRESS_NOTES}
                      value={record.progressNotes}
                      id='progressNotes'
                      onChange={onChangeCallback('progressNotes')}
                      display={false}
                      styles={textAreaStyles}
                      preserveNewlines
                      markdown
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box display='flex' justifyContent='flex-end'>
                    <Button
                      id='cancel'
                      label={strings.CANCEL}
                      type='passive'
                      onClick={handleCancel}
                      priority='secondary'
                      key='button-1'
                    />
                    <Button id='save' onClick={onSave} label={strings.SAVE} key='button-2' priority='secondary' />
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={3}>
                {metric.projectsComments && (
                  <Grid item xs={6}>
                    <Typography fontSize='16px' fontWeight={600} marginBottom={1}>
                      {strings.PROJECTS_COMMENTS}
                    </Typography>
                    <Typography fontSize='14px' color={theme.palette.TwClrBaseBlack} sx={{ whiteSpace: 'pre-wrap' }}>
                      {metric.projectsComments}
                    </Typography>
                  </Grid>
                )}
                {metric.progressNotes && (
                  <Grid item xs={6}>
                    <Typography fontSize='16px' fontWeight={600} marginBottom={1}>
                      {strings.PROGRESS_NOTES}
                    </Typography>
                    <Typography fontSize='14px' color={theme.palette.TwClrBaseBlack} sx={{ whiteSpace: 'pre-wrap' }}>
                      {metric.progressNotes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        </Collapse>
      </Box>

      <Divider />
    </Box>
  );
};

export default MetricRow;
