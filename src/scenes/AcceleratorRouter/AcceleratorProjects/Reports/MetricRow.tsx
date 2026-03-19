import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Box, Collapse, Divider, Grid, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem, Icon, Textfield } from '@terraware/web-components';

import EditProgressModal from 'src/components/AcceleratorReports/EditProgressModal';
import MetricStatusBadge from 'src/components/AcceleratorReports/MetricStatusBadge';
import ResetMetricModal from 'src/components/AcceleratorReports/ResetMetricModal';
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
import { formatPrecision } from 'src/utils/numbers';
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
  hideProgressNotes?: boolean;
  hideProjectsComments?: boolean;
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
  hideProgressNotes = false,
  hideProjectsComments = false,
  onEditChange,
}: MetricRowProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const [expanded, setExpanded] = useState(false);
  const [record, setRecord, onChange, onChangeCallback] = useForm<IndicatorMetric>(metric);
  const [internalEditing, setInternalEditing, setInternalEditingTrue, setInternalEditingFalse] = useBoolean(false);
  const [progressModalOpened, , openProgressModal, closeProgressModal] = useBoolean(false);
  const [resetMetricModalOpened, , openResetMetricModal, closeResetMetricModal] = useBoolean(false);

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
      const val = record.overrideValue ?? record.systemValue;
      return val !== undefined ? Number(val) : 0;
    }
    if (isCommonOrProjectIndicator(record)) {
      return record.value !== undefined && record.value !== null ? Number(record.value) : 0;
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

  const hasActualValue = isAutoCalculatedIndicator(record)
    ? record.overrideValue !== undefined || record.systemValue !== undefined
    : isCommonOrProjectIndicator(record)
      ? record.value !== undefined && record.value !== null
      : false;
  const hasTargetValue = metric.target !== undefined && metric.target !== null;

  const currentYearProgress = metric.currentYearProgress;
  const isCumulative = metric.classId === 'Cumulative';
  const previousYearCumulativeTotal = metric.previousYearCumulativeTotal ?? 0;
  const hasCumulativeEntries = (currentYearProgress?.length ?? 0) > 0 || previousYearCumulativeTotal !== 0;
  const cumulativeValue = isCumulative
    ? (currentYearProgress?.reduce((sum, q) => sum + q.value, 0) ?? 0) + previousYearCumulativeTotal
    : 0;
  const baseline = metric.baseline ?? 0;
  const precision = metric.precision ?? 0;
  const hasPreviousYear = metric.previousYearCumulativeTotal !== undefined;
  const previousYearDisplayValue = hasPreviousYear ? metric.previousYearCumulativeTotal : baseline;
  const previousYearDisplayLabel = hasPreviousYear ? String((year ?? 0) - 1) : strings.BASELINE;
  const displayValue = isCumulative ? cumulativeValue : actualValue;
  const completionDenominator = targetValue - baseline;
  const percentComplete =
    completionDenominator !== 0 ? Math.round(((displayValue - baseline) / completionDenominator) * 100) : 0;
  const showPercentComplete = hasActualValue && hasTargetValue;

  const hasComments = (!hideProjectsComments && !!metric.projectsComments) || (!hideProgressNotes && !!metric.progressNotes);
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
        autoCalculatedIndicators: [
          {
            indicator: record.indicator,
            overrideValue: record.overrideValue !== undefined ? Number(record.overrideValue) : undefined,
            ...baseMetric,
          },
        ],
        commonIndicators: [],
        projectIndicators: [],
      };
    } else if (type === 'common' && isCommonOrProjectIndicator(record)) {
      return {
        commonIndicators: [
          {
            id: record.id,
            value: record.value !== undefined && record.value !== null ? Number(record.value) : undefined,
            ...baseMetric,
          },
        ],
        autoCalculatedIndicators: [],
        projectIndicators: [],
      };
    } else if (type === 'project' && isCommonOrProjectIndicator(record)) {
      return {
        projectIndicators: [
          {
            id: record.id,
            value: record.value !== undefined && record.value !== null ? Number(record.value) : undefined,
            ...baseMetric,
          },
        ],
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

  const onChangeProgress = useCallback(
    (newValue: string | undefined) => {
      onChange('overrideValue', newValue !== undefined && newValue !== '' ? Number(newValue) : undefined);
    },
    [onChange]
  );

  const onResetIndicator = useCallback(() => {
    onChange('overrideValue', undefined);
    closeResetMetricModal();
  }, [onChange, closeResetMetricModal]);

  const actualValueLabel = `${reportLabel} ${strings.ACTUAL}${unit ? ` (${unit})` : ''}`;

  const renderActualValueInput = () => {
    if (isAutoCalculatedIndicator(record)) {
      const displayVal = record.overrideValue ?? record.systemValue;
      return (
        <Box>
          <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} marginBottom={0.5}>
            {actualValueLabel}
          </Typography>
          <Box display='flex' alignItems='center'>
            <Typography fontSize='20px' fontWeight={600}>
              {displayVal !== undefined ? `${formatPrecision(displayVal, precision)}${unit ? ` ${unit}` : ''}` : '--'}
            </Typography>
            {record.overrideValue === undefined && (
              <Tooltip title={strings.TERRAWARE_METRIC_MESSAGE}>
                <Box display='flex' alignItems='center' paddingLeft={1}>
                  <Icon name='iconDataMigration' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
                </Box>
              </Tooltip>
            )}
            {record.overrideValue !== undefined && (
              <Button icon='iconUndo' onClick={openResetMetricModal} priority='ghost' size='small' type='passive' />
            )}
            <Button icon='iconEdit' onClick={openProgressModal} priority='ghost' size='small' type='passive' />
          </Box>
          {record.overrideValue !== undefined && (
            <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary} paddingTop={0.5}>
              {strings.formatString(
                strings.OVERWRITTEN_ORIGINAL_VALUE,
                record.systemValue !== undefined ? formatPrecision(record.systemValue, precision) : ''
              )}
            </Typography>
          )}
        </Box>
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
    <>
      {progressModalOpened && isAutoCalculatedIndicator(record) && (
        <EditProgressModal
          metricName={getMetricName()}
          target={targetValue}
          onChange={onChangeProgress}
          value={record.overrideValue ?? record.systemValue ?? 0}
          onClose={closeProgressModal}
        />
      )}
      {resetMetricModalOpened && <ResetMetricModal onClose={closeResetMetricModal} onSubmit={onResetIndicator} />}
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
                  status={metric.status}
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
                  <Box display='flex' alignItems='center'>
                    <Typography fontSize='20px' fontWeight={600}>
                      {hasCumulativeEntries
                        ? `${formatPrecision(cumulativeValue, precision)}${unit ? ` ${unit}` : ''}`
                        : '--'}
                    </Typography>
                    {hasCumulativeEntries &&
                      isAutoCalculatedIndicator(metric) &&
                      metric.overrideValue === undefined && (
                        <Tooltip title={strings.TERRAWARE_METRIC_MESSAGE}>
                          <Box display='flex' alignItems='center' paddingLeft={1}>
                            <Icon name='iconDataMigration' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
                          </Box>
                        </Tooltip>
                      )}
                  </Box>
                </>
              ) : (
                <>
                  <Typography
                    fontSize='14px'
                    fontWeight={400}
                    color={theme.palette.TwClrTxtSecondary}
                    marginBottom={0.5}
                  >
                    {reportLabel} {strings.ACTUAL}
                  </Typography>
                  <Box display='flex' alignItems='center'>
                    <Typography fontSize='20px' fontWeight={600}>
                      {hasActualValue ? `${formatPrecision(actualValue, precision)}${unit ? ` ${unit}` : ''}` : '--'}
                    </Typography>
                    {hasActualValue && isAutoCalculatedIndicator(metric) && metric.overrideValue === undefined && (
                      <Tooltip title={strings.TERRAWARE_METRIC_MESSAGE}>
                        <Box display='flex' alignItems='center' paddingLeft={1}>
                          <Icon name='iconDataMigration' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                  {isAutoCalculatedIndicator(metric) && metric.overrideValue !== undefined && (
                    <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary} paddingTop={0.5}>
                      {strings.formatString(
                        strings.OVERWRITTEN_ORIGINAL_VALUE,
                        metric.systemValue !== undefined ? formatPrecision(metric.systemValue, precision) : ''
                      )}
                    </Typography>
                  )}
                </>
              )}
            </Box>

            <Divider orientation='vertical' flexItem sx={{ marginX: 2 }} />

            <Box flex={1} paddingX={2}>
              <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} marginBottom={0.5}>
                {year} {strings.TARGET}
              </Typography>
              <Typography fontSize='20px' fontWeight={600}>
                {hasTargetValue ? `${formatPrecision(targetValue, precision)}${unit ? ` ${unit}` : ''}` : '--'}
              </Typography>
            </Box>

            <Divider orientation='vertical' flexItem sx={{ marginX: 2 }} />

            <Box flex={1} paddingX={2}>
              <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} marginBottom={0.5}>
                {year} % {strings.COMPLETE}
              </Typography>
              <Typography fontSize='20px' fontWeight={600}>
                {showPercentComplete ? `${percentComplete}%` : '--'}
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
                  <Typography
                    fontSize='14px'
                    fontWeight={400}
                    color={theme.palette.TwClrTxtSecondary}
                    marginBottom={0.5}
                  >
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

                  {!isCumulative && <Grid item xs={4} />}

                  <Grid item xs={4}>
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

                  {!hideProgressNotes && (
                    <Grid item xs={4}>
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
                        {internalEditing && (
                          <Typography fontSize={14} color={theme.palette.TwClrTxtSecondary}>
                            {strings.PROGRESS_NOTES_DESCRIPTION}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  )}

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
                    <Grid item xs={4}>
                      <Typography fontSize='14px' fontWeight={600} marginBottom={0.5}>
                        {reportLabel} {strings.ACTUAL}
                      </Typography>
                      <Box display='flex' alignItems='center'>
                        <Typography fontSize='28px' fontWeight={600}>
                          {hasActualValue
                            ? `${formatPrecision(actualValue, precision)}${unit ? ` ${unit}` : ''}`
                            : '--'}
                        </Typography>
                        {hasActualValue && isAutoCalculatedIndicator(metric) && metric.overrideValue === undefined && (
                          <Tooltip title={strings.TERRAWARE_METRIC_MESSAGE}>
                            <Box display='flex' alignItems='center' paddingLeft={1}>
                              <Icon
                                name='iconDataMigration'
                                size='medium'
                                fillColor={theme.palette.TwClrIcnSecondary}
                              />
                            </Box>
                          </Tooltip>
                        )}
                      </Box>
                      {isAutoCalculatedIndicator(metric) && metric.overrideValue !== undefined && (
                        <Typography fontSize='14px' color={theme.palette.TwClrTxtSecondary} paddingTop={0.5}>
                          {strings.formatString(
                            strings.OVERWRITTEN_ORIGINAL_VALUE,
                            metric.systemValue !== undefined ? formatPrecision(metric.systemValue, precision) : ''
                          )}
                        </Typography>
                      )}
                    </Grid>
                  )}
                  {!isCumulative && ((!hideProjectsComments && metric.projectsComments) || (!hideProgressNotes && metric.progressNotes)) && (
                    <Grid item xs={4} />
                  )}
                  {!hideProjectsComments && metric.projectsComments ? (
                    <Grid item xs={4}>
                      <Typography fontSize='16px' fontWeight={600} marginBottom={1}>
                        {strings.PROJECTS_COMMENTS}
                      </Typography>
                      <Typography fontSize='14px' color={theme.palette.TwClrBaseBlack} sx={{ whiteSpace: 'pre-wrap' }}>
                        {metric.projectsComments}
                      </Typography>
                    </Grid>
                  ) : (
                    !hideProgressNotes && metric.progressNotes && <Grid item xs={4} />
                  )}
                  {!hideProgressNotes && metric.progressNotes && (
                    <Grid item xs={4}>
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
    </>
  );
};

export { isAutoCalculatedIndicator };
export default MetricRow;
