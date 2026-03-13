import React, { type JSX, useEffect } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Icon, Textfield, Tooltip } from '@terraware/web-components';

import {
  ReportAutoCalculatedIndicatorPayload,
  ReportCommonIndicatorPayload,
  ReportProjectIndicatorPayload,
} from 'src/queries/generated/reports';
import strings from 'src/strings';
import { IndicatorType } from 'src/types/AcceleratorReport';
import { formatPrecision } from 'src/utils/numbers';
import useForm from 'src/utils/useForm';

import EditableReportBox from './EditableReportBox';

type IndicatorMetric =
  | ReportAutoCalculatedIndicatorPayload
  | ReportCommonIndicatorPayload
  | ReportProjectIndicatorPayload;

const isAutoCalculated = (m: IndicatorMetric): m is ReportAutoCalculatedIndicatorPayload =>
  'indicator' in m && typeof m.indicator === 'string';

const textAreaStyles = { textarea: { height: '120px' } };

type IndicatorBoxProps = {
  editing?: boolean;
  metric: IndicatorMetric;
  type: IndicatorType;
  year?: number;
  onChangeIndicator?: (metric: IndicatorMetric, type: IndicatorType) => void;
};

const IndicatorBox = ({ editing = false, metric, type, year, onChangeIndicator }: IndicatorBoxProps): JSX.Element => {
  const theme = useTheme();
  const [record, , , onChangeCallback] = useForm<IndicatorMetric>(metric);

  useEffect(() => {
    if (JSON.stringify(record) !== JSON.stringify(metric)) {
      onChangeIndicator?.(record, type);
    }
  }, [metric, onChangeIndicator, record, type]);

  const precision = metric.precision ?? 0;

  const getName = () => {
    if (isAutoCalculated(metric)) {
      return metric.indicator;
    }
    return (metric as ReportCommonIndicatorPayload).name;
  };

  const getProgressValue = () => {
    if (isAutoCalculated(record)) {
      return record.overrideValue ?? record.systemValue;
    }
    return (record as ReportCommonIndicatorPayload).value;
  };

  return (
    <EditableReportBox
      name={getName()}
      canEdit={false}
      onEdit={() => undefined}
      onCancel={() => undefined}
      onSave={() => undefined}
      editing={editing}
      visibleToFunder={metric.isPublishable}
      description={metric.description}
    >
      <Grid item xs={6}>
        {isAutoCalculated(record) ? (
          <Box paddingBottom={theme.spacing(2)}>
            <Typography fontSize={'14px'} color={theme.palette.TwClrTxtSecondary}>
              {strings.PROGRESS}
            </Typography>
            <Box display={'flex'} alignItems={'center'} paddingTop={1.5} paddingBottom={theme.spacing(2)}>
              <Typography>
                {record.overrideValue !== undefined
                  ? formatPrecision(record.overrideValue, precision)
                  : record.systemValue !== undefined
                    ? formatPrecision(record.systemValue, precision)
                    : '--'}{' '}
                / {metric.target !== undefined && metric.target !== null ? formatPrecision(metric.target, precision) : '--'} (
                {year} {strings.TARGET})
              </Typography>
              {record.overrideValue === undefined && (
                <Box paddingTop={1} paddingLeft={1.5}>
                  <Tooltip title={strings.TERRAWARE_METRIC_MESSAGE}>
                    <Icon name='iconDataMigration' size='medium' fillColor={theme.palette.TwClrIcnSecondary} />
                  </Tooltip>
                </Box>
              )}
            </Box>
            {record.overrideValue !== undefined && (
              <Typography fontSize={'14px'} color={theme.palette.TwClrTxtSecondary} paddingTop={1.5}>
                {strings.formatString(
                  strings.OVERWRITTEN_ORIGINAL_VALUE,
                  record.systemValue !== undefined ? formatPrecision(record.systemValue, precision) : ''
                )}
              </Typography>
            )}
          </Box>
        ) : (
          <Box display='flex' alignItems='center' paddingBottom={theme.spacing(2)}>
            <Textfield
              type='number'
              label={strings.PROGRESS}
              value={getProgressValue()}
              id='value'
              onChange={onChangeCallback('value')}
              display={!editing}
              required={true}
              min={0}
            />
            <Typography paddingTop={3} paddingLeft={0.5}>
              / {metric.target !== undefined && metric.target !== null ? formatPrecision(metric.target, precision) : '--'} (
              {year} {strings.TARGET})
            </Typography>
            {'unit' in record && record.unit && (
              <Box paddingLeft={theme.spacing(3)}>
                <Textfield type='text' label={strings.UNIT} value={record.unit} id='unit' display={true} />
              </Box>
            )}
          </Box>
        )}
      </Grid>
      <Grid item xs={6}>
        <Box paddingRight={theme.spacing(2)} sx={{ '.markdown a': { wordBreak: 'break-word' } }}>
          <Textfield
            type='textarea'
            label={strings.PROJECTS_COMMENTS}
            value={record.projectsComments}
            id='projectsComments'
            onChange={onChangeCallback('projectsComments')}
            display={!editing}
            styles={textAreaStyles}
            preserveNewlines
            markdown
          />
        </Box>
      </Grid>
    </EditableReportBox>
  );
};

export default IndicatorBox;
