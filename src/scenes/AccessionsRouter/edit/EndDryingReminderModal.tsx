import React, { type JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Grid } from '@mui/material';
import getDateDisplayValue, { isInTheFuture } from '@terraware/web-components/utils/date';

import DatePicker from 'src/components/common/DatePicker';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import useAccession from 'src/hooks/useAccession';
import { useOrganization } from 'src/providers';
import { useUpdateAccessionMutation } from 'src/queries/generated/accessionsV2';
import strings from 'src/strings';
import { Accession } from 'src/types/Accession';
import { getSeedBank } from 'src/utils/organization';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

export interface EndDryingReminderModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EndDryingReminderModal({ open, onClose }: EndDryingReminderModalProps): JSX.Element | null {
  const { accessionId } = useParams<{ accessionId: string }>();
  const { accession } = useAccession(Number(accessionId));

  if (!accession) {
    return null;
  }

  return <EndDryingReminderModalForm accession={accession} open={open} onClose={onClose} />;
}

interface EndDryingReminderModalFormProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
}

function EndDryingReminderModalForm({ accession, open, onClose }: EndDryingReminderModalFormProps): JSX.Element {
  const [date, setDate] = useState<string | undefined>(accession.dryingEndDate);
  const [dateError, setDateError] = useState<string>('');
  const [record, setRecord, onChange] = useForm(accession);
  const snackbar = useSnackbar();
  const [updateAccession] = useUpdateAccessionMutation();
  const { selectedOrganization } = useOrganization();
  const timeZoneId = useLocationTimeZone().get(
    selectedOrganization ? getSeedBank(selectedOrganization, accession.facilityId) : undefined
  )?.id;

  useEffect(() => {
    setRecord(accession);
  }, [accession, setRecord]);

  const closeModal = () => {
    setRecord(accession);
    setDate(accession.dryingEndDate);
    setDateError('');
    onClose();
  };

  const saveState = async () => {
    if (!validateDate(date)) {
      return;
    }
    if (record) {
      try {
        await updateAccession({
          id: record.id,
          updateAccessionRequestPayloadV2: record,
        }).unwrap();
        onClose();
      } catch {
        snackbar.toastError();
      }
    }
  };

  const validateDate = (newValue?: string | number | undefined) => {
    setDateError('');

    // Invalid dates or blank entries will remove the reminder date
    if (!newValue) {
      setDateError(strings.INVALID_DATE);
      return true;
    } else if (!isInTheFuture(newValue)) {
      setDateError(strings.DATE_MUST_BE_FUTURE);
      return false;
    } else {
      return true;
    }
  };

  const changeDate = (id: string, value?: any) => {
    setDate(value);

    const newDate = value ? getDateDisplayValue(value.getTime(), timeZoneId) : null;
    onChange(id, newDate);

    validateDate(value);
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
        <Button id='saveDryingReminder' onClick={() => void saveState()} label={strings.SET_REMINDER} key='button-2' />,
      ]}
    >
      <Grid item xs={12} textAlign='left'>
        <DatePicker
          aria-label={strings.END_DRYING_REMINDER}
          defaultTimeZone={timeZoneId}
          errorText={dateError}
          id='dryingEndDate'
          label={strings.END_DRYING_REMINDER}
          onChange={(value) => changeDate('dryingEndDate', value)}
          value={date}
        />
      </Grid>
    </DialogBox>
  );
}
