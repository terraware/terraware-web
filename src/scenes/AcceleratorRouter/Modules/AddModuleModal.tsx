import React, { useEffect } from 'react';

import { Grid, useTheme } from '@mui/material';
import { DatePicker, SelectT } from '@terraware/web-components';
import { DateTime } from 'luxon';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import useListModules from 'src/hooks/useListModules';
import { useAppDispatch } from 'src/redux/store';
import strings from 'src/strings';
import { CohortModule, Module } from 'src/types/Module';
import useForm from 'src/utils/useForm';

export interface AddModuleModalProps {
  onClose: () => void;
  onSave: (cohortModule: CohortModule) => void;
}

export default function AddModuleModal(props: AddModuleModalProps): JSX.Element {
  const { onClose, onSave } = props;

  const dispatch = useAppDispatch();
  const theme = useTheme();

  const { modules, listModules } = useListModules();
  const [record, setRecord, onChange] = useForm<CohortModule>({});

  useEffect(() => {
    void listModules({});
  }, [dispatch]);

  const onChangeModule = (moduleSelected: CohortModule) => {
    setRecord((prev) => {
      return { ...prev, id: moduleSelected.id, name: moduleSelected.name };
    });
  };

  const save = () => {
    onSave(record);
    onClose();
  };

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
            onChange={(value: unknown) => onChange('title', value)}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <SelectT<Module>
            id='module'
            label={strings.MODULE}
            placeholder={strings.SELECT}
            options={modules}
            onChange={(_module: Module) => {
              onChangeModule(_module);
            }}
            selectedValue={modules?.find((iModule) => iModule.id === record.id)}
            fullWidth={true}
            isEqual={(a: Module, b: Module) => a.id === b.id}
            renderOption={(_module: Module) => _module?.name || ''}
            displayLabel={(_module: Module) => _module?.name || ''}
            toT={(name: string) => ({ name }) as Module}
            required
          />
        </Grid>
        <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingRight: 1 }}>
          <DatePicker
            id='startDate'
            label={strings.START_DATE}
            value={record.startDate}
            onDateChange={(value?: DateTime) => {
              onChange('startDate', value?.toFormat('yyyy-MM-dd'));
            }}
            aria-label='date-picker'
          />
        </Grid>
        <Grid item xs={6} sx={{ marginTop: theme.spacing(2), paddingLeft: 1 }}>
          <DatePicker
            id='endDate'
            label={strings.END_DATE}
            value={record.endDate}
            onDateChange={(value) => {
              onChange('endDate', value?.toFormat('yyyy-MM-dd'));
            }}
            aria-label='date-picker'
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
