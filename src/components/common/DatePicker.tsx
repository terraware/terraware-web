import { createStyles, makeStyles } from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import moment from 'moment';
import 'moment/min/locales';
import React, { KeyboardEventHandler } from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      margin: 0,
    },
  })
);

export interface Props {
  id: string;
  label: React.ReactNode;
  value?: string | null;
  onChange: (id: string, value?: string) => void;
  'aria-label': string;
  onKeyPress?: KeyboardEventHandler;
  maxDate?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export default function DatePicker(props: Props): JSX.Element {
  const classes = useStyles();
  const onDateChange = (date: MaterialUiPickersDate) => {
    if (date && date.isValid()) {
      props.onChange(props.id, date?.toISOString());
    } else {
      props.onChange(props.id, date?.toString());
    }
  };

  React.useEffect(() => {
    moment.locale([window.navigator.language, 'en']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.navigator.language]);

  return (
    <KeyboardDatePicker
      id={props.id}
      value={props.value ?? null}
      onChange={onDateChange}
      label={props.label}
      KeyboardButtonProps={{
        'aria-label': props['aria-label'],
      }}
      disableToolbar
      variant='inline'
      inputVariant='outlined'
      format={moment.localeData().longDateFormat('L')}
      margin='normal'
      size='small'
      fullWidth={true}
      className={classes.root}
      onKeyPress={props.onKeyPress}
      maxDate={props.maxDate ?? undefined}
      error={props.error}
      helperText={props.helperText}
      disabled={props.disabled}
    />
  );
}
