import React, { type JSX } from 'react';

import { Textfield } from '@terraware/web-components';

import DatePicker from 'src/components/common/DatePicker';
import OverviewItemCard from 'src/components/common/OverviewItemCard';

export const infoCardStyles = {
  padding: 0,
  'white-space': 'pre',
};

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
      titleInfoTooltip={tooltipTitle}
      sx={infoCardStyles}
    />
  );
};
