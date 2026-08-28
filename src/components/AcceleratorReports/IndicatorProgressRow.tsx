import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Collapse, IconButton, Link, Tooltip, Typography, useTheme } from '@mui/material';
import { Badge, Dropdown, DropdownItem, Icon, IconTooltip, Textfield } from '@terraware/web-components';

import EmptyFieldPlaceholder from 'src/components/AcceleratorReports/EmptyFieldPlaceholder';
import IndicatorStatusBadge from 'src/components/AcceleratorReports/IndicatorStatusBadge';
import LifetimeProgressBar from 'src/components/AcceleratorReports/LifetimeProgressBar';
import ResetIndicatorModal from 'src/components/AcceleratorReports/ResetIndicatorModal';
import {
  ProgressIndicator,
  getIndicatorCumulativeValue,
  indicatorClassLabel,
} from 'src/components/AcceleratorReports/utils';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import { formatPrecision } from 'src/utils/numbers';

const TITLE_COLUMN_WIDTH = 300;
const BAR_HEIGHT = 12;
const TICK_OVERHANG = 3;
const MIN_TARGET_PERCENT = 90;
const TICK_HOVER_WIDTH = 9;

type IndicatorProgressRowProps = {
  editing?: boolean;
  indicator: ProgressIndicator;
  onChange?: (id: string, value: unknown) => void;
  printMode?: boolean;
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  isConsoleView?: boolean;
  year?: number;
};

const IndicatorProgressRow = ({
  editing,
  indicator,
  onChange,
  printMode,
  quarter,
  isConsoleView,
  year,
}: IndicatorProgressRowProps): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const [expanded, setExpanded] = useState(false);
  const [resetModalOpened, setResetModalOpened] = useState(false);
  const [overwriting, setOverwriting] = useState(false);

  // both cumulative classes accumulate the year's quarters; only the lifetime one reaches back past
  // the start of the year
  const isLifetime = indicator.classId === 'Lifetime Cumulative';
  const isYearly = indicator.classId === 'Yearly Cumulative';
  const isCumulative = isLifetime || isYearly;
  const isAutoCalculated = indicator.type === 'autoCalculated';
  const precision = indicator.precision ?? 0;
  const baselineValue = indicator.baseline ?? 0;

  // a yearly indicator restarts at zero each year, so it carries neither the baseline nor a prior total
  const startingTotal = isLifetime ? indicator.previousYearCumulativeTotal ?? baselineValue : 0;

  const startingTotalLabel =
    indicator.previousYearCumulativeTotal !== undefined && year !== undefined ? String(year - 1) : strings.BASELINE;

  const enteredValue = isAutoCalculated ? indicator.overrideValue ?? indicator.systemValue : indicator.value;

  // A cumulative total is the earlier quarters plus this one, so substitute the entered value for this
  // quarter and re-sum; that keeps the year and lifetime bars in step while the value is being edited.
  const currentYearProgress = useMemo(() => {
    const progress = indicator.currentYearProgress ?? [];

    if (enteredValue === undefined || quarter === undefined) {
      return progress;
    }

    const withCurrentQuarter = progress.some((entry) => entry.quarter === quarter)
      ? progress.map((entry) => (entry.quarter === quarter ? { ...entry, value: enteredValue } : entry))
      : [...progress, { quarter, value: enteredValue }];

    return [...withCurrentQuarter].sort((a, b) => a.quarter.localeCompare(b.quarter));
  }, [enteredValue, indicator.currentYearProgress, quarter]);

  const cumulativeValue = useMemo(
    () => getIndicatorCumulativeValue({ ...indicator, value: enteredValue }, currentYearProgress),
    [currentYearProgress, enteredValue, indicator]
  );

  const quarterlyValue = useMemo(
    () => (isCumulative ? currentYearProgress.find((progress) => progress.quarter === quarter)?.value : undefined),
    [currentYearProgress, isCumulative, quarter]
  );

  // Pins an overshot target no further left than MIN_TARGET_PERCENT, so the bar past it stays visible.
  const { segments, targetPercent } = useMemo(() => {
    const barMin = startingTotal;
    const total = cumulativeValue ?? 0;
    const target = indicator.target;
    const barMax = Math.max(total, target ?? 0, barMin);
    const range = barMax - barMin;

    const anchorPercent =
      target !== undefined && range > 0 ? Math.max(MIN_TARGET_PERCENT, ((target - barMin) / range) * 100) : undefined;

    const toPercent = (value: number) => {
      if (range <= 0) {
        return 0;
      }

      if (anchorPercent === undefined || target === undefined) {
        return ((value - barMin) / range) * 100;
      }

      if (value <= target) {
        const belowTarget = target - barMin;
        return belowTarget > 0 ? ((value - barMin) / belowTarget) * anchorPercent : 0;
      }

      const aboveTarget = barMax - target;
      return aboveTarget > 0 ? anchorPercent + ((value - target) / aboveTarget) * (100 - anchorPercent) : anchorPercent;
    };

    let runningTotal = barMin;
    const barSegments =
      isCumulative && currentYearProgress.length > 0
        ? currentYearProgress.map((progress) => {
            const startPercent = toPercent(runningTotal);
            runningTotal += progress.value;

            return {
              key: progress.quarter,
              quarter: progress.quarter,
              startPercent,
              widthPercent: toPercent(runningTotal) - startPercent,
            };
          })
        : [{ key: 'total', quarter: undefined, startPercent: 0, widthPercent: toPercent(total) }];

    return { segments: barSegments, targetPercent: anchorPercent };
  }, [cumulativeValue, currentYearProgress, indicator.target, isCumulative, startingTotal]);

  const fillColor =
    indicator.status === 'Unlikely'
      ? theme.palette.TwClrTxtDanger
      : indicator.status === 'Off-Track'
        ? theme.palette.TwClrTxtWarning
        : theme.palette.TwClrBgBrand;

  const statusColor =
    indicator.status === 'Unlikely'
      ? theme.palette.TwClrTxtDanger
      : indicator.status === 'Off-Track'
        ? theme.palette.TwClrTxtWarning
        : indicator.status === undefined
          ? theme.palette.TwClrTxtBrand
          : theme.palette.TwClrTxtSuccess;

  const targetPercentComplete = useMemo(() => {
    const target = indicator.target;

    if (target === undefined || target <= 0) {
      return undefined;
    }

    // a yearly target measures the year's progress alone, so the project baseline is not on its scale
    const origin = isYearly ? 0 : baselineValue;
    const denominator = target - origin;

    if (denominator <= 0) {
      return undefined;
    }

    return Math.round((((cumulativeValue ?? 0) - origin) / denominator) * 100);
  }, [baselineValue, cumulativeValue, indicator.target, isYearly]);

  const statusOptions = useMemo<DropdownItem[]>(
    () => [
      { label: strings.ACHIEVED, value: 'Achieved' },
      { label: strings.ON_TRACK, value: 'On-Track' },
      { label: strings.UNLIKELY, value: 'Unlikely' },
      { label: strings.OFF_TRACK, value: 'Off-Track' },
    ],
    [strings]
  );

  const fieldKey = `${indicator.type ?? 'indicator'}-${indicator.id ?? indicator.name}`.replace(/\s+/g, '-');

  const onToggle = useCallback(() => setExpanded((previous) => !previous), []);

  const openResetModal = useCallback(() => setResetModalOpened(true), []);
  const closeResetModal = useCallback(() => setResetModalOpened(false), []);
  const startOverwriting = useCallback(() => setOverwriting(true), []);

  const hasOverride = indicator.overrideValue !== undefined;

  // an auto-calculated value comes from tracking data, so it only opens up on request
  const valueDisabled = isAutoCalculated && !hasOverride && !overwriting;

  const onChangeValue = useCallback(
    (value: unknown) => {
      // clearing the box means no progress rather than no value, so it lands as zero
      const parsed = value === '' || value === undefined || value === null ? 0 : Number(value);
      onChange?.(isAutoCalculated ? 'overrideValue' : 'value', parsed);
    },
    [isAutoCalculated, onChange]
  );

  const onReset = useCallback(() => {
    onChange?.('overrideValue', undefined);
    setOverwriting(false);
    closeResetModal();
  }, [closeResetModal, onChange]);

  const unitSuffix = indicator.unit ? (
    <Typography component='span' color={theme.palette.TwClrTxtSecondary} fontSize='14px' fontWeight={400}>
      {` ${indicator.unit}`}
    </Typography>
  ) : null;

  const progressNotes = (
    <>
      <Typography fontSize='14px' fontWeight={600}>
        {strings.PROGRESS_NOTES}
      </Typography>

      {indicator.progressNotes ? (
        <Typography fontSize='14px'>{indicator.progressNotes}</Typography>
      ) : (
        <EmptyFieldPlaceholder text={strings.NO_NOTES_ADDED} />
      )}
    </>
  );

  return (
    <Box
      borderTop={`1px solid ${theme.palette.TwClrBgTertiary}`}
      className={printMode ? 'print-section' : undefined}
      padding={theme.spacing(2, 0)}
    >
      <Box display='flex'>
        <Box flexShrink={0} paddingRight={theme.spacing(2)} width={`${TITLE_COLUMN_WIDTH}px`}>
          <Box alignItems='center' display='flex'>
            <Typography fontSize='14px' fontWeight={600} lineHeight='20px'>
              {indicator.name}
            </Typography>

            {indicator.description && !printMode && <IconTooltip title={indicator.description} />}
          </Box>

          <Box columnGap={theme.spacing(1)} display='flex' flexWrap='wrap' marginTop={theme.spacing(1)} rowGap={1}>
            {indicator.status && <IndicatorStatusBadge status={indicator.status} />}

            <Badge
              backgroundColor={theme.palette.TwClrBgSecondary}
              borderColor={theme.palette.TwClrBaseGray300}
              label={indicatorClassLabel(indicator.classId, strings)}
              labelColor={theme.palette.TwClrTxtSecondary}
            />

            {isConsoleView && (
              <Box
                alignItems='center'
                border={`1px solid ${
                  indicator.isPublishable ? theme.palette.TwClrBrdrBrand : theme.palette.TwClrBaseGray300
                }`}
                borderRadius={theme.spacing(0.5)}
                display='flex'
                padding={theme.spacing(0.25, 0.75)}
              >
                <Icon
                  fillColor={indicator.isPublishable ? theme.palette.TwClrIcnBrand : theme.palette.TwClrIcnSecondary}
                  name={indicator.isPublishable ? 'iconEye' : 'lock'}
                  size='small'
                />
              </Box>
            )}
          </Box>
        </Box>

        <Box flexGrow={1} minWidth={0}>
          <Box marginBottom={theme.spacing(1)} position='relative'>
            <Box alignItems='baseline' columnGap={theme.spacing(1)} display='flex'>
              <Typography fontSize='20px' fontWeight={600} lineHeight='28px'>
                {cumulativeValue !== undefined ? formatPrecision(cumulativeValue, precision) : '--'}
                {cumulativeValue !== undefined && unitSuffix}
              </Typography>

              {quarterlyValue !== undefined && (
                <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
                  {strings.formatString(
                    strings.X_THIS_QUARTER,
                    `+${formatPrecision(quarterlyValue, precision)}${indicator.unit ? ` ${indicator.unit}` : ''}`
                  )}
                </Typography>
              )}
            </Box>

            <Typography
              color={theme.palette.TwClrTxtSecondary}
              fontSize='14px'
              position='absolute'
              sx={
                targetPercent !== undefined
                  ? { left: `${targetPercent}%`, transform: 'translateX(-100%)' }
                  : { right: 0 }
              }
              top={0}
              whiteSpace='nowrap'
            >
              {indicator.target !== undefined && (
                <>
                  {`${isLifetime ? strings.CUMULATIVE_TARGET : strings.TARGET} `}
                  <Typography component='span' fontSize='14px' fontWeight={600}>
                    {formatPrecision(indicator.target, precision)}
                  </Typography>
                  {unitSuffix}
                </>
              )}
            </Typography>
          </Box>

          {indicator.target === undefined ? (
            <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' fontStyle='italic'>
              {strings.NO_TARGET_SET}
            </Typography>
          ) : (
            <Box position='relative'>
              <Box
                borderRadius='4px'
                height={`${BAR_HEIGHT}px`}
                overflow='hidden'
                position='relative'
                sx={{ backgroundColor: theme.palette.TwClrBaseGray100 }}
              >
                {segments.map((segment) => (
                  <Box
                    key={segment.key}
                    sx={{
                      backgroundColor: fillColor,
                      height: '100%',
                      left: `${segment.startPercent}%`,
                      position: 'absolute',
                      width: `${segment.widthPercent}%`,
                    }}
                  />
                ))}
              </Box>

              {segments.map((segment) => (
                <Tooltip key={`tick-${segment.key}`} title={printMode ? '' : segment.quarter ?? ''}>
                  <Box
                    sx={{
                      display: 'flex',
                      height: `${BAR_HEIGHT}px`,
                      justifyContent: 'center',
                      left: `${segment.startPercent + segment.widthPercent}%`,
                      position: 'absolute',
                      top: 0,
                      transform: 'translateX(-50%)',
                      width: `${TICK_HOVER_WIDTH}px`,
                    }}
                  >
                    <Box sx={{ backgroundColor: theme.palette.TwClrBaseWhite, height: '100%', width: '1px' }} />
                  </Box>
                </Tooltip>
              ))}

              {isLifetime && (
                <Tooltip title={printMode ? '' : startingTotalLabel}>
                  <Box
                    sx={{
                      display: 'flex',
                      height: `${BAR_HEIGHT + TICK_OVERHANG * 2}px`,
                      left: 0,
                      position: 'absolute',
                      top: `-${TICK_OVERHANG}px`,
                      width: `${TICK_HOVER_WIDTH}px`,
                    }}
                  >
                    <Box sx={{ backgroundColor: theme.palette.TwClrBaseBlack, height: '100%', width: '2px' }} />
                  </Box>
                </Tooltip>
              )}

              {targetPercent !== undefined && (
                <Box
                  sx={{
                    backgroundColor: theme.palette.TwClrBaseBlack,
                    height: `${BAR_HEIGHT + TICK_OVERHANG * 2}px`,
                    left: `${targetPercent}%`,
                    position: 'absolute',
                    top: `-${TICK_OVERHANG}px`,
                    transform: 'translateX(-50%)',
                    width: '2px',
                  }}
                />
              )}
            </Box>
          )}

          {targetPercentComplete !== undefined && (
            <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' marginTop={theme.spacing(1)}>
              {strings.formatString(
                isLifetime ? strings.X_OF_YEAR_CUMULATIVE_TARGET : strings.X_OF_YEAR_TARGET,
                <Typography component='span' color={statusColor} fontSize='14px' fontWeight={600} key='percent'>
                  {`${targetPercentComplete}%`}
                </Typography>
              )}
            </Typography>
          )}

          {isLifetime && (
            <LifetimeProgressBar
              baseline={indicator.baseline}
              currentProgress={cumulativeValue ?? 0}
              endOfProjectTarget={indicator.endOfProjectTarget}
              previousYearCumulativeTotal={indicator.previousYearCumulativeTotal}
              year={year}
              yearTarget={indicator.target}
            />
          )}
        </Box>

        {!printMode && (
          <Box flexShrink={0} paddingLeft={theme.spacing(1)} width={theme.spacing(5)}>
            <IconButton onClick={onToggle} size='small'>
              <Icon name={expanded ? 'chevronUp' : 'chevronDown'} />
            </IconButton>
          </Box>
        )}
      </Box>

      {printMode ? (
        <Box paddingTop={theme.spacing(2)}>{progressNotes}</Box>
      ) : (
        <Collapse in={expanded}>
          {editing ? (
            <Box display='flex' flexWrap='wrap' gap={theme.spacing(3)} paddingTop={theme.spacing(2)}>
              <Box flex='1 1 45%' minWidth={0}>
                <Box alignItems='flex-end' display='flex' gap={theme.spacing(1)}>
                  <Box flexGrow={1}>
                    <Textfield
                      disabled={valueDisabled}
                      id={`value-${fieldKey}`}
                      label={strings.PROGRESS_VALUE}
                      min={0}
                      onChange={onChangeValue}
                      type='number'
                      value={enteredValue ?? ''}
                    />
                  </Box>

                  {isAutoCalculated &&
                    (valueDisabled ? (
                      <Tooltip title={strings.OVERWRITE_TERRAWARE_TRACKING_DATA}>
                        <Box>
                          <Button
                            icon='iconEdit'
                            onClick={startOverwriting}
                            priority='ghost'
                            size='small'
                            type='passive'
                          />
                        </Box>
                      </Tooltip>
                    ) : (
                      <Button icon='iconUndo' onClick={openResetModal} priority='ghost' size='small' type='passive' />
                    ))}
                </Box>

                {isAutoCalculated && hasOverride && indicator.systemValue !== undefined && (
                  <Typography color={theme.palette.TwClrTxtSecondary} fontSize='12px'>
                    {strings.formatString(
                      strings.INDICATOR_OVERWRITTEN_ORIGINAL_VALUE,
                      `${formatPrecision(indicator.systemValue, precision)}${indicator.unit ? ` ${indicator.unit}` : ''}`
                    )}
                  </Typography>
                )}
              </Box>

              <Box flex='1 1 45%' minWidth={0}>
                <Dropdown
                  fullWidth
                  label={strings.STATUS}
                  onChange={(value: string) => onChange?.('status', value)}
                  options={statusOptions}
                  placeholder={strings.NO_STATUS}
                  selectedValue={indicator.status}
                />
              </Box>

              <Box flex='1 1 45%' minWidth={0}>
                <Textfield
                  id={`projectsComments-${fieldKey}`}
                  label={strings.PROJECTS_COMMENTS}
                  onChange={(value: unknown) => onChange?.('projectsComments', value)}
                  preserveNewlines
                  type='textarea'
                  value={indicator.projectsComments ?? ''}
                />
              </Box>

              {isConsoleView && (
                <Box flex='1 1 45%' minWidth={0}>
                  <Textfield
                    id={`progressNotes-${fieldKey}`}
                    label={strings.NOTES_TO_FUNDER}
                    onChange={(value: unknown) => onChange?.('progressNotes', value)}
                    preserveNewlines
                    type='textarea'
                    value={indicator.progressNotes ?? ''}
                  />

                  <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px'>
                    {strings.PROGRESS_NOTES_DESCRIPTION}
                  </Typography>
                </Box>
              )}

              <Box flex='1 1 45%' minWidth={0}>
                <Textfield
                  id={`supportingDocumentUrl-${fieldKey}`}
                  label={strings.LINK_TO_SUPPORTING_DOCUMENTS}
                  onChange={(value: unknown) => onChange?.('supportingDocumentUrl', value)}
                  type='text'
                  value={indicator.supportingDocumentUrl ?? ''}
                />
              </Box>
            </Box>
          ) : (
            <Box display='flex' flexWrap='wrap' gap={theme.spacing(3)} paddingTop={theme.spacing(2)}>
              <Box flex='1 1 45%' minWidth={0}>
                <Typography fontSize='14px' fontWeight={600}>
                  {strings.PROJECTS_COMMENTS}
                </Typography>

                {indicator.projectsComments ? (
                  <Typography fontSize='14px'>{indicator.projectsComments}</Typography>
                ) : (
                  <EmptyFieldPlaceholder text={strings.NO_COMMENTS_ADDED} />
                )}
              </Box>

              <Box flex='1 1 45%' minWidth={0}>
                {progressNotes}
              </Box>

              <Box flexBasis='100%'>
                <Typography fontSize='14px' fontWeight={600}>
                  {strings.LINK_TO_SUPPORTING_DOCUMENTS}
                </Typography>

                {indicator.supportingDocumentUrl ? (
                  <Link href={indicator.supportingDocumentUrl} rel='noopener noreferrer' target='_blank'>
                    <Typography fontSize='14px'>{strings.VIEW_DOCUMENTS}</Typography>
                  </Link>
                ) : (
                  <EmptyFieldPlaceholder text={strings.NO_LINK_ADDED} />
                )}
              </Box>
            </Box>
          )}
        </Collapse>
      )}

      {resetModalOpened && <ResetIndicatorModal onClose={closeResetModal} onSubmit={onReset} />}
    </Box>
  );
};

export default IndicatorProgressRow;
