import React, { useCallback, useMemo, useState } from 'react';

import { Box, Grid } from '@mui/material';
import { BusySpinner, Icon, Textfield } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import isEnabled from 'src/features';
import { useUser } from 'src/providers';
import { NurseryBatchService } from 'src/services';
import { ChangeBatchStatusesRequestPayload } from 'src/services/NurseryBatchService';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import useSnackbar from 'src/utils/useSnackbar';

import { ModalValuesType } from './BatchesCellRenderer';

export interface ChangeQuantityModalProps {
  modalValues: ModalValuesType;
  onClose: () => void;
  reload?: () => void;
  row: any;
}

export default function ChangeQuantityModal({
  modalValues,
  onClose,
  reload,
  row,
}: ChangeQuantityModalProps): JSX.Element {
  const { type } = modalValues;
  const snackbar = useSnackbar();
  const { user } = useUser();
  const numberFormatter = useNumberFormatter(user?.locale);

  const isUpdatedNurseryGrowthPhasesEnabled = isEnabled('Updated Nursery Growth Phases');

  const [saving, setSaving] = useState<boolean>(false);
  const [movedValue, setMovedValue] = useState<number | undefined>();
  const [errorText, setErrorText] = useState<string>('');
  const [record, setRecord] = useForm({
    ...row,
    germinatingQuantity: +row['germinatingQuantity(raw)'],
    hardeningOffQuantity: +row['hardeningOffQuantity(raw)'],
    notReadyQuantity: +row['notReadyQuantity(raw)'],
    readyQuantity: +row['readyQuantity(raw)'],
  });

  const title = useMemo(() => {
    switch (type) {
      case 'germinating':
        return strings.CHANGE_GERMINATING_STATUS;
      case 'hardening-off':
        return strings.CHANGE_HARDENING_OFF_STATUS;
      case 'not-ready':
        return strings.CHANGE_NOT_READY_STATUS;
      default:
        return '';
    }
  }, [type]);

  const onCloseHandler = useCallback(() => {
    setMovedValue(undefined);
    setRecord(row);
    onClose();
  }, [row, onClose, setRecord]);

  const onSubmit = useCallback(async () => {
    if (movedValue === undefined || movedValue === 0) {
      setErrorText(strings.REQUIRED_FIELD);
      return;
    } else if (type === 'germinating' && movedValue > +row['germinatingQuantity(raw)']) {
      setErrorText(strings.GERMINATING_QUANTITY_CANNOT_BE_LESS_THAN_ZERO);
      return;
    } else if (type === 'not-ready' && movedValue > +row['notReadyQuantity(raw)']) {
      setErrorText(strings.NOT_READY_QUANTITY_CANNOT_BE_LESS_THAN_ZERO);
      return;
    } else if (type === 'hardeningOff' && movedValue > +row['hardeningOffQuantity(raw)']) {
      setErrorText(strings.HARDENING_OFF_QUANTITY_CANNOT_BE_LESS_THAN_ZERO);
      return;
    }

    setSaving(true);

    let previousPhase: ChangeBatchStatusesRequestPayload['previousPhase'];
    let newPhase: ChangeBatchStatusesRequestPayload['newPhase'];

    if (type === 'germinating') {
      previousPhase = 'Germinating';
      newPhase = 'NotReady';
    } else if (type === 'not-ready') {
      previousPhase = 'NotReady';
      newPhase = isUpdatedNurseryGrowthPhasesEnabled ? 'HardeningOff' : 'Ready';
    } else if (type === 'hardening-off') {
      previousPhase = 'HardeningOff';
      newPhase = 'Ready';
    }

    const response = await NurseryBatchService.changeBatchStatuses(record, {
      newPhase,
      previousPhase,
      quantity: movedValue,
    });

    setSaving(false);

    if (response.requestSucceeded) {
      if (reload) {
        reload();
      }
      onCloseHandler();
    } else {
      snackbar.toastError();
    }
  }, [isUpdatedNurseryGrowthPhasesEnabled, movedValue, onCloseHandler, record, reload, row, snackbar, type]);

  const onSave = useCallback(() => {
    void onSubmit();
  }, [onSubmit]);

  const onChangeMovedValue = useCallback(
    (value: unknown) => {
      if (value && !isNaN(value as number) && (value as number) > 0) {
        const valueNumber = value as number;
        setMovedValue(valueNumber);
        if (type === 'germinating') {
          setRecord({
            ...row,
            germinatingQuantity: +row['germinatingQuantity(raw)'] - valueNumber,
            notReadyQuantity: +row['notReadyQuantity(raw)'] + +valueNumber,
            hardeningOffQuantity: +row['hardeningOffQuantity(raw)'],
            readyQuantity: +row['readyQuantity(raw)'],
          });
        } else if (type === 'not-ready' && isUpdatedNurseryGrowthPhasesEnabled) {
          setRecord({
            ...row,
            germinatingQuantity: +row['germinatingQuantity(raw)'],
            notReadyQuantity: +row['notReadyQuantity(raw)'] - valueNumber,
            hardeningOffQuantity: +row['hardeningOffQuantity(raw)'] + +valueNumber,
            readyQuantity: +row['readyQuantity(raw)'],
          });
        } else if (type === 'not-ready' && !isUpdatedNurseryGrowthPhasesEnabled) {
          setRecord({
            ...row,
            germinatingQuantity: +row['germinatingQuantity(raw)'],
            notReadyQuantity: +row['notReadyQuantity(raw)'] - valueNumber,
            hardeningOffQuantity: +row['hardeningOffQuantity(raw)'],
            readyQuantity: +row['readyQuantity(raw)'] + +valueNumber,
          });
        } else {
          setRecord({
            ...row,
            germinatingQuantity: +row['germinatingQuantity(raw)'],
            notReadyQuantity: +row['notReadyQuantity(raw)'],
            hardeningOffQuantity: +row['hardeningOffQuantity(raw)'] - valueNumber,
            readyQuantity: +row['readyQuantity(raw)'] + +valueNumber,
          });
        }
      } else {
        setRecord(row);
        setMovedValue(undefined);
      }
    },
    [isUpdatedNurseryGrowthPhasesEnabled, row, setMovedValue, setRecord, type]
  );

  const fromLabel = useMemo(() => {
    if (type === 'germinating') {
      return strings.GERMINATING;
    } else if (type === 'not-ready') {
      return strings.NOT_READY;
    } else {
      return strings.HARDENING_OFF;
    }
  }, [type]);

  const fromValueFormatted = useMemo(() => {
    if (type === 'germinating') {
      return numberFormatter.format(record.germinatingQuantity);
    } else if (type === 'not-ready') {
      return numberFormatter.format(record.notReadyQuantity);
    } else {
      return numberFormatter.format(record.hardeningOffQuantity);
    }
  }, [numberFormatter, record, type]);

  const toLabel = useMemo(() => {
    if (type === 'germinating') {
      return strings.NOT_READY;
    } else if (type === 'not-ready' && isUpdatedNurseryGrowthPhasesEnabled) {
      return strings.HARDENING_OFF;
    } else {
      return strings.READY;
    }
  }, [isUpdatedNurseryGrowthPhasesEnabled, type]);

  const toValueFormatted = useMemo(() => {
    if (type === 'germinating') {
      return numberFormatter.format(record.notReadyQuantity);
    } else if (type === 'not-ready' && isUpdatedNurseryGrowthPhasesEnabled) {
      return numberFormatter.format(record.hardeningOffQuantity);
    } else {
      return numberFormatter.format(record.readyQuantity);
    }
  }, [isUpdatedNurseryGrowthPhasesEnabled, numberFormatter, record, type]);

  return (
    <DialogBox
      onClose={onCloseHandler}
      open
      size='medium'
      title={title}
      middleButtons={[
        <Button
          id='cancelChangeQuantity'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onCloseHandler}
          size='medium'
          key='button-1'
        />,
        <Button
          id='saveChangeQuantity'
          label={strings.SAVE}
          onClick={onSave}
          type='productive'
          size='medium'
          key='button-2'
        />,
      ]}
    >
      <Grid>
        {saving && <BusySpinner withSkrim />}
        <Grid item xs={11} textAlign='left' display='flex'>
          <Textfield display id='previousValue' label={fromLabel} type='number' value={fromValueFormatted} />

          <Box maxWidth='120px' marginLeft={2}>
            <Textfield
              value={movedValue}
              label={strings.MOVE}
              id='movedValue'
              type='number'
              onChange={onChangeMovedValue}
              errorText={errorText}
            />
          </Box>
          <Box paddingLeft={1} paddingRight={3} paddingTop={4}>
            <Icon name='iconArrowRight' />
          </Box>
          <Textfield display id='changedValue' label={toLabel} type='number' value={toValueFormatted} />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
