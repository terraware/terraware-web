import React from 'react';

import { Grid, useTheme } from '@mui/material';
import { DatePicker } from '@terraware/web-components';
import { DateTime } from 'luxon';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import { ModuleEvent } from 'src/types/Module';
import useForm from 'src/utils/useForm';

export interface AddEventModalProps {
  onClose: () => void;
  onSave: (eventModule: ModuleEvent) => void;
  moduleId: number;
  type: 'One-on-One Session' | 'Workshop' | 'Live Session' | 'Recorded Session';
  moduleName: string;
  eventToEdit?: ModuleEvent;
}

export default function AddEventModal(props: AddEventModalProps): JSX.Element {
  const { onClose, onSave, eventToEdit, moduleId, moduleName, type } = props;

  const theme = useTheme();

  const [record, , onChange] = useForm<ModuleEvent>(
    eventToEdit || { id: -1, moduleId: moduleId, type: type, moduleName: moduleName, status: 'Not Started' }
  );

  const save = () => {
    onSave(record);
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.EVENT_DETAILS}
      size='large'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={save} label={strings.ADD} key='button-2' />,
      ]}
    >
      <Grid container textAlign={'left'} spacing={2}>
        <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingRight: 1 }}>
          <DatePicker
            id='startTime'
            label={strings.START_DATE}
            value={record.startTime}
            onDateChange={(value?: DateTime) => {
              onChange('startTime', value?.toFormat('yyyy-MM-dd'));
            }}
            aria-label='date-picker'
          />
        </Grid>
        <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingLeft: 1 }}>
          <DatePicker
            id='endTime'
            label={strings.END_DATE}
            value={record.endTime}
            onDateChange={(value) => {
              onChange('endTime', value?.toFormat('yyyy-MM-dd'));
            }}
            aria-label='date-picker'
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='meetingUrl'
            label={strings.MEETING_URL}
            type='text'
            value={record.meetingUrl}
            onChange={(value: unknown) => onChange('meetingUrl', value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='recordingUrl'
            label={strings.RECORDING_URL}
            type='text'
            value={record.recordingUrl}
            onChange={(value: unknown) => onChange('recordingUrl', value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id='slidesUrl'
            label={strings.SLIDES_URL}
            type='text'
            value={record.slidesUrl}
            onChange={(value: unknown) => onChange('slidesUrl', value)}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
