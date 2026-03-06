import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Box, Collapse, Divider, Grid, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Icon, Textfield } from '@terraware/web-components';

import MetricStatusBadge from 'src/components/AcceleratorReports/MetricStatusBadge';
import ProgressChart from 'src/components/common/Chart/ProgressChart';
import Button from 'src/components/common/button/Button';
import useBoolean from 'src/hooks/useBoolean';
import { useLocalization } from 'src/providers';
import {
  ReportAutoCalculatedIndicatorPayload,
  ReportCommonIndicatorPayload,
  ReportProjectIndicatorPayload,
  useReviewAcceleratorReportIndicatorsMutation,
} from 'src/queries/generated/reports';
import { IndicatorType } from 'src/types/AcceleratorReport';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

const isAutoCalculatedIndicator = (m: any): m is ReportAutoCalculatedIndicatorPayload =>
  m && typeof m.indicator === 'string';

const isCommonOrProjectIndicator = (m: any): m is ReportCommonIndicatorPayload | ReportProjectIndicatorPayload =>
  m && typeof m.id === 'number';

const indicatorStatusOptions: DropdownItem[] = (['Achieved', 'On-Track', 'Unlikely', 'Off-Track'] as const).map(
  (status) => ({ label: status, value: status })
);

const textAreaStyles = { textarea: { height: '120px' } };

type IndicatorMetric =
  | ReportAutoCalculatedIndicatorPayload
  | ReportCommonIndicatorPayload
  | ReportProjectIndicatorPayload;

type MetricRowProps = {
  metric: IndicatorMetric;
  type: IndicatorType;
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
  const [record, setRecord, , onChangeCallback] = useForm<IndicatorMetric>(metric);
  const [internalEditing, setInternalEditing, setInternalEditingTrue, setInternalEditingFalse] = useBoolean(false);

  const [reviewReportIndicators, reviewReportIndicatorsResponse] = useReviewAcceleratorReportIndicatorsMutation();
  const snackbar = useSnackbar();

  useEffect(() => onEditChange?.(internalEditing), [internalEditing, onEditChange]);

  useEffect(() => {
    if (reviewReportIndicatorsResponse.isError) {
      snackbar.toastError();
    } else if (reviewReportIndicatorsResponse.isSuccess) {
      setInternalEditing(false);
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    }
  }, [
    snackbar,
    setInternalEditing,
    strings,
    reviewReportIndicatorsResponse.isError,
    reviewReportIndicatorsResponse.isSuccess,
  ]);

  useEffect(() => {
    if (!internalEditing) {
      setRecord(metric);
    }
  }, [internalEditing, metric, setRecord]);

  const getMetricName = () => {
    if (isAutoCalculatedIndicator(metric)) {
      return metric.indicator;
    }
    if (isCommonOrProjectIndicator(metric)) {
      return metric.name;
    }
    return '';
  };

  const getActualValue = () => {
    if (isAutoCalculatedIndicator(record)) {
      return record.overrideValue ?? record.systemValue ?? 0;
    }
    if (isCommonOrProjectIndicator(record)) {
      return record.value ?? 0;
    }
    return 0;
  };

  const getUnit = () => {
    if (isCommonOrProjectIndicator(metric) && 'unit' in metric) {
      return metric.unit ?? '';
    }
    return '';
  };

  const targetValue = metric.target ?? 0;
  const actualValue = getActualValue();
  const unit = getUnit();

  const currentYearProgress = metric.currentYearProgress;
  const isCumulative = metric.classId === 'Cumulative';
  const cumulativeValue = isCumulative ? currentYearProgress?.reduce((sum, q) => sum + q.value, 0) ?? 0 : 0;
  const baseline = metric.baseline ?? 0;
  const hasPreviousYear = metric.previousYearCumulativeTotal !== undefined;
  const previousYearDisplayValue = hasPreviousYear ? metric.previousYearCumulativeTotal : baseline;
  const previousYearDisplayLabel = hasPreviousYear ? String((year ?? 0) - 1) : strings.BASELINE;
  const displayValue = isCumulative ? cumulativeValue : actualValue;
  const completionDenominator = targetValue - baseline;
  const percentComplete =
    completionDenominator !== 0 ? Math.round(((displayValue - baseline) / completionDenominator) * 100) : 0;

  const hasComments = !!metric.projectsComments || !!metric.progressNotes;
  const canExpand = hasComments || isCumulative;

  const onToggle = useCallback(() => {
    if (!internalEditing && canExpand) {
      setExpanded((prev) => !prev);
    }
  }, [canExpand, internalEditing]);

  const getUpdateBody = useCallback(() => {
    const baseMetric = {
      projectsComments: record.projectsComments,
      progressNotes: record.progressNotes,
      status: record.status,
    };
    if (type === 'autoCalculated' && isAutoCalculatedIndicator(record)) {
      return {
        autoCalculatedIndicators: [{ indicator: record.indicator, overrideValue: record.overrideValue, ...baseMetric }],
        commonIndicators: [],
        projectIndicators: [],
      };
    } else if (type === 'common' && isCommonOrProjectIndicator(record)) {
      return {
        commonIndicators: [{ id: record.id, value: record.value, ...baseMetric }],
        autoCalculatedIndicators: [],
        projectIndicators: [],
      };
    } else if (type === 'project' && isCommonOrProjectIndicator(record)) {
      return {
        projectIndicators: [{ id: record.id, value: record.value, ...baseMetric }],
        autoCalculatedIndicators: [],
        commonIndicators: [],
      };
    }
    return { autoCalculatedIndicators: [], commonIndicators: [], projectIndicators: [] };
  }, [record, type]);

  const onSave = useCallback(() => {
    void reviewReportIndicators({
      projectId,
      reportId,
      reviewAcceleratorReportIndicatorsRequestPayload: getUpdateBody(),
    });
  }, [getUpdateBody, projectId, reportId, reviewReportIndicators]);

  const handleCancel = useCallback(() => {
    setRecord(metric);
    setInternalEditingFalse();
  }, [metric, setInternalEditingFalse, setRecord]);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const actualValueLabel = `${reportLabel} ${strings.ACTUAL}${unit ? ` (${unit})` : ''}`;

  const renderActualValueInput = () => {
    if (isAutoCalculatedIndicator(record)) {
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
    if (isCommonOrProjectIndicator(record)) {
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
              : canEdit || canExpand
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
            cursor: !internalEditing && canExpand ? 'pointer' : 'default',
          }}
          onClick={onToggle}
        >
          <Box flex={3} paddingRight={2}>
            <Typography fontSize='16px' fontWeight={600} marginBottom={internalEditing ? 0 : 1}>
              {getMetricName()}
            </Typography>
            {!internalEditing && (
              <ProgressChart
                value={actualValue}
                target={targetValue}
                quarterlyProgress={isCumulative ? currentYearProgress : undefined}
                reportLabel={!isCumulative ? reportLabel : undefined}
                previousYearValue={isCumulative ? previousYearDisplayValue : undefined}
                previousYearLabel={isCumulative ? previousYearDisplayLabel : undefined}
                yearLabel={isCumulative ? String(year) : undefined}
                targetLabel={isCumulative ? strings.TARGET : undefined}
              />
            )}
          </Box>

          <Divider orientation='vertical' flexItem sx={{ marginX: 2 }} />

          <Box flex={1} paddingX={2}>
            {internalEditing && !isCumulative ? (
              renderActualValueInput()
            ) : isCumulative ? (
              <>
                <Box display='flex' alignItems='center' gap={0.5} marginBottom={0.5}>
                  <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
                    {strings.CUMULATIVE_PROGRESS}
                  </Typography>
                  <Tooltip title={strings.CUMULATIVE_PROGRESS_TOOLTIP}>
                    <Box display='flex' alignItems='center'>
                      <Icon name='info' size='small' fillColor={theme.palette.TwClrTxtSecondary} />
                    </Box>
                  </Tooltip>
                </Box>
                <Typography fontSize='20px' fontWeight={600}>
                  {cumulativeValue} {unit}
                </Typography>
              </>
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
              {year} % {strings.COMPLETE}
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
                options={indicatorStatusOptions}
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
            <IconButton size='small' sx={{ marginLeft: 1, visibility: canExpand ? 'visible' : 'hidden' }}>
              <Icon
                name={expanded ? 'chevronUp' : 'chevronDown'}
                size='medium'
                fillColor={theme.palette.TwClrIcnSecondary}
              />
            </IconButton>
          )}
        </Box>

        <Collapse in={internalEditing || (canExpand && expanded)} unmountOnExit>
          <Box padding={theme.spacing(0, 3, 3, 3)}>
            {internalEditing ? (
              <Grid container spacing={3}>
                {isCumulative && (
                  <Grid item xs={4}>
                    {renderActualValueInput()}
                  </Grid>
                )}

                <Grid item xs={isCumulative ? 4 : 6}>
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

                <Grid item xs={isCumulative ? 4 : 6}>
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
                {isCumulative && (
                  <Grid item xs={3}>
                    <Typography fontSize='14px' fontWeight={600} marginBottom={0.5}>
                      {reportLabel} {strings.ACTUAL}
                    </Typography>
                    <Typography fontSize='28px' fontWeight={600}>
                      {actualValue} {unit}
                    </Typography>
                  </Grid>
                )}
                {metric.projectsComments && (
                  <Grid item xs={isCumulative ? 4 : 6}>
                    <Typography fontSize='16px' fontWeight={600} marginBottom={1}>
                      {strings.PROJECTS_COMMENTS}
                    </Typography>
                    <Typography fontSize='14px' color={theme.palette.TwClrBaseBlack} sx={{ whiteSpace: 'pre-wrap' }}>
                      {metric.projectsComments}
                    </Typography>
                  </Grid>
                )}
                {metric.progressNotes && (
                  <Grid item xs={isCumulative ? 5 : 6}>
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

export { isAutoCalculatedIndicator };
export default MetricRow;
