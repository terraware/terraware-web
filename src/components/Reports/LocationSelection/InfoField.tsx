import React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';
import { DatePicker, Textfield } from '@terraware/web-components';
import OverviewItemCard from 'src/components/common/OverviewItemCard';

type InfoFieldProps = {
  id: string;
  label: string;
  editable: boolean;
  value: string | number;
  onChange: (value: any) => void;
  type: 'text' | 'date';
  helper?: string;
  errorText?: string;
  minNum?: number;
  maxNum?: number;
  maxDate?: any;
  minDate?: any;
  tooltipTitle?: string;
};

export const useInfoCardStyles = makeStyles((theme: Theme) => ({
  infoCardStyle: {
    padding: 0,
    'white-space': 'pre',
  },
}));

export const InfoField = (props: InfoFieldProps): JSX.Element => {
  const {
    id,
    label,
    editable,
    value,
    onChange,
    type,
    helper,
    errorText,
    minNum,
    maxNum,
    maxDate,
    minDate,
    tooltipTitle,
  } = props;
  const classes = useInfoCardStyles();

  return editable ? (
    type === 'text' ? (
      <Textfield
        label={label}
        id={id}
        type='number'
        value={value}
        min={minNum}
        max={maxNum}
        display={!editable}
        onChange={onChange}
        helperText={helper}
        errorText={errorText}
        tooltipTitle={tooltipTitle}
      />
    ) : type === 'date' ? (
      <DatePicker
        id={id}
        label={label}
        value={value as string}
        onChange={onChange}
        aria-label='date-picker'
        errorText={errorText}
        maxDate={maxDate}
        minDate={minDate}
        helperText={tooltipTitle}
      />
    ) : (
      <></>
    )
  ) : (
    <OverviewItemCard
      isEditable={false}
      title={label}
      contents={value.toString() ?? '0'}
      className={classes.infoCardStyle}
      titleInfoTooltip={tooltipTitle}
    />
  );
};
