import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Grid, useTheme } from '@mui/material';
import { Checkbox, DatePicker } from '@terraware/web-components';
import { Accession } from 'src/types/Accession';
import AccessionService from 'src/services/AccessionService';
import useForm from 'src/utils/useForm';
import { getTodaysDateFormatted } from '@terraware/web-components/utils';
import useSnackbar from 'src/utils/useSnackbar';

export interface EndDryingReminderModalProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
  reload: () => void;
}

export default function EndDryingReminderModal(props: EndDryingReminderModalProps): JSX.Element {
  const { onClose, open, accession, reload } = props;
  const [enable, setEnable] = useState<boolean>(!!accession.dryingEndDate);
  const [date, setDate] = useState<string | undefined>(accession.dryingEndDate);
  const [dateError, setDateError] = useState<string>('');
  const [record, setRecord, onChange] = useForm(accession);
  const theme = useTheme();
  const snackbar = useSnackbar();

  useEffect(() => {
    setRecord(accession);
  }, [accession, setRecord]);

  const closeModal = () => {
    setRecord(accession);
    setEnable(!!accession.dryingEndDate);
    setDate(accession.dryingEndDate);
    setDateError('');
    onClose();
  };

  const saveState = async () => {
    if (!validate(date)) {
      return;
    }
    if (record) {
      const response = await AccessionService.updateAccession(record);
      if (response.requestSucceeded) {
        reload();
        onClose();
      } else {
        snackbar.toastError();
      }
    }
  };

  const onEnable = (id: string, value: boolean) => {
    setEnable(value);
    if (!value) {
      setDate(undefined);
      onChange('dryingEndDate', undefined);
    }
  };

  const validate = (dateValue: string | undefined): boolean => {
    setDateError('');

    if (!dateValue) {
      if (!enable) {
        return true;
      } else {
        setDateError(strings.REQUIRED_FIELD);
        return false;
      }
    }

    const dateMs = new Date(dateValue).getTime();
    const today = new Date(getTodaysDateFormatted()).getTime();

    if (isNaN(dateMs)) {
      setDateError(strings.INVALID_DATE);
      return false;
    } else if (dateMs < today) {
      setDateError(strings.NO_PAST_DATES);
      return false;
    }

    return true;
  };

  const changeDate = (id: string, value?: any) => {
    setDate(value);
    if (validate(value)) {
      onChange('dryingEndDate', value);
    }
  };

  return (
    <DialogBox
      onClose={closeModal}
      open={open}
      title={strings.END_DRYING_REMINDER}
      size='small'
      middleButtons={[
        <Button
          id='cancelDryingReminder'
          label={strings.CANCEL}
          type='passive'
          onClick={closeModal}
          priority='secondary'
          key='button-1'
        />,
        <Button id='saveDryingReminder' onClick={saveState} label={strings.SAVE} key='button-2' />,
      ]}
    >
      <Grid item xs={12} textAlign='left'>
        <Grid item xs={12} marginBottom={theme.spacing(1)}>
          <Checkbox
            id='enable'
            name=''
            label={strings.TURN_ON_END_DRYING_REMINDER}
            onChange={(value) => onEnable('enable', value)}
            value={enable}
          />
        </Grid>
        <DatePicker
          id='dryingEndDate'
          label={strings.REMINDER_DATE}
          aria-label={strings.REMINDER_DATE}
          value={date}
          onChange={(value) => changeDate('dryingEndDate', value)}
          errorText={dateError}
          disabled={!enable}
        />
      </Grid>
    </DialogBox>
  );
}
