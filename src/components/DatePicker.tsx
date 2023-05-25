import moment from 'moment-timezone';
import 'moment/min/locales';
import React, { useState, KeyboardEventHandler } from 'react';
import { TextField } from '@mui/material';
import { LocalizationProvider, DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import Icon from '@terraware/web-components/components/Icon/Icon';
import '@terraware/web-components/components/DatePicker/styles.scss';

export interface Props {
  id: string;
  autoFocus?: boolean;
  label: React.ReactNode;
  value?: string | null;
  onChange: (value?: string | null) => void;
  'aria-label': string;
  onKeyPress?: KeyboardEventHandler;
  minDate?: any;
  maxDate?: any;
  defaultTimeZone?: string;
  locale?: string;
  errorText?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
  onError?: (reason: any, value: any) => void;
}

export default function DatePicker(props: Props): JSX.Element {
  const [temporalValue, setTemporalValue] = useState(props.value || null);
  const locale = props.locale ?? 'en';
  React.useEffect(() => {
    moment.locale([locale]);
  }, [locale]);

  React.useEffect(() => {
    if (props.value !== temporalValue && props.value !== null) {
      setTemporalValue(props.value || null);
    }
  }, [props.value, temporalValue]);

  const renderInput = (params: object) => (
    <>
      <TextField {...params} id={props.id} autoFocus={props.autoFocus} onKeyPress={props.onKeyPress} />
      {props.errorText && (
        <div className='textfield-error-text-container'>
          <Icon name='error' className='textfield-error-text--icon' />
          <label htmlFor={props.id} className='textfield-error-text'>
            {props.errorText}
          </label>
        </div>
      )}
    </>
  );

  // set timezone, defaulting to 'UTC'
  moment.tz.setDefault(props.defaultTimeZone ?? 'UTC');

  // TODO: Localize the yyyy-mm-dd placeholder string that is shown to users when the input is
  //       empty. It appears to be generated programmatically deep in the guts of the MUI DatePicker
  //       code, and it most likely uses the browser's locale.
  return (
    <div className={`date-picker ${props.className} ${props.errorText ? 'date-picker--error' : ''}`}>
      <LocalizationProvider dateAdapter={AdapterMoment} dateLibInstance={moment} adapterLocale={locale}>
        {props.label && (
          <label htmlFor={props.id} className='textfield-label'>
            {props.label}
          </label>
        )}
        <DesktopDatePicker
          onError={props.onError}
          minDate={props.minDate ? moment(props.minDate) : undefined}
          maxDate={props.maxDate ? moment(props.maxDate) : undefined}
          inputFormat='YYYY-MM-DD'
          value={temporalValue}
          onChange={(newValue: any) => {
            setTemporalValue(newValue);
            props.onChange(newValue?.isValid() ? newValue?.toDate() : null);
          }}
          renderInput={renderInput}
          disabled={props.disabled}
        />
      </LocalizationProvider>
    </div>
  );
}
