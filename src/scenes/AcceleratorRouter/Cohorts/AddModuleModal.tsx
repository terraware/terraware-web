import React, { type JSX, useMemo, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { Autocomplete, DatePicker, DropdownItem } from '@terraware/web-components';
import { DateTime } from 'luxon';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { ProjectModulePayload } from 'src/queries/generated/projectModules';
import strings from 'src/strings';
import { CohortModule, Module } from 'src/types/Module';
import useForm from 'src/utils/useForm';

export interface AddModuleModalProps {
  onClose: () => void;
  onSave: (cohortModule: CohortModule | ProjectModulePayload) => void;
  selectedModule?: CohortModule | ProjectModulePayload;
  unusedModules: Module[] | ProjectModulePayload[];
}

export default function AddModuleModal(props: AddModuleModalProps): JSX.Element {
  const { onClose, onSave, selectedModule, unusedModules } = props;

  const theme = useTheme();

  const [record, , onChange, onChangeCallback] = useForm<Partial<CohortModule>>(selectedModule ?? {});
  const [validate, setValidate] = useState(false);

  const save = () => {
    if (!record.title || !record.id || !record.endDate || !record.startDate) {
      setValidate(true);
      return;
    }

    const endDateDate = new Date(record.endDate);
    const startDateDate = new Date(record.startDate);

    if (endDateDate < startDateDate) {
      setValidate(true);
      return;
    }

    if (selectedModule) {
      onSave({ ...selectedModule, ...record });
    } else {
      const module = unusedModules.find((_module) => _module.id === record.id);
      if (module !== undefined) {
        const today = Date.now();
        const isActive = startDateDate.valueOf() <= today && today <= endDateDate.valueOf();
        onSave({
          ...module,
          title: record.title,
          startDate: record.startDate,
          endDate: record.endDate,
          isActive,
        });
      }
    }
  };

  const dropdownOptions: DropdownItem[] = useMemo(() => {
    const unusedOptions = unusedModules.map((module) => ({
      label: `(${module.id}) ${module.name}`,
      value: module.id,
    }));

    const selectedOption = selectedModule
      ? [
          {
            label: `(${selectedModule.id}), ${selectedModule.name}`,
            value: selectedModule.id,
          },
        ]
      : [];

    return [...unusedOptions, ...selectedOption].toSorted((a, b) => a.value - b.value);
  }, [unusedModules, selectedModule]);

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.MODULE_DETAILS}
      size='medium'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={save} label={strings.SAVE} key='button-2' />,
      ]}
    >
      <Grid container textAlign={'left'}>
        <Grid item xs={12}>
          <TextField
            id='title'
            label={strings.NAME}
            type='text'
            value={record.title}
            onChange={onChangeCallback('title')}
            errorText={validate && !record.title ? strings.REQUIRED_FIELD : undefined}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <Autocomplete
            label={strings.MODULE}
            onChange={(option) => {
              const dropdown = option as DropdownItem;
              onChange('id', dropdown.value);
            }}
            options={dropdownOptions}
            selected={dropdownOptions.find((option) => option.value === selectedModule?.id)}
            required
            disabled={selectedModule !== undefined}
          />
        </Grid>
        <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingRight: 1 }}>
          <DatePicker
            id='startDate'
            label={strings.START_DATE_REQUIRED}
            value={record.startDate}
            onDateChange={(value?: DateTime) => {
              onChange('startDate', value?.toFormat('yyyy-MM-dd'));
            }}
            aria-label='date-picker'
            errorText={validate ? strings.INVALID_DATE : undefined}
          />
        </Grid>
        <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingLeft: 1 }}>
          <DatePicker
            id='endDate'
            label={strings.END_DATE_REQUIRED}
            value={record.endDate}
            onDateChange={(value) => {
              onChange('endDate', value?.toFormat('yyyy-MM-dd'));
            }}
            aria-label='date-picker'
            errorText={validate ? strings.INVALID_DATE : undefined}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
