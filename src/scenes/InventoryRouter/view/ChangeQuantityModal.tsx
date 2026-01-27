import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid } from '@mui/material';
import { BusySpinner, Dropdown, Icon, Textfield } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
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
  const numberFormatter = useNumberFormatter();

  const [nextPhase, setNextPhase] = useState<ChangeBatchStatusesRequestPayload['newPhase']>();
  const [saving, setSaving] = useState<boolean>(false);
  const [movedValue, setMovedValue] = useState<number | undefined>();
  const [errorText, setErrorText] = useState<string>('');
  const [record, setRecord] = useForm({
    ...row,
    germinatingQuantity: +row['germinatingQuantity(raw)'],
    hardeningOffQuantity: +row['hardeningOffQuantity(raw)'],
    activeGrowthQuantity: +row['activeGrowthQuantity(raw)'],
    readyQuantity: +row['readyQuantity(raw)'],
  });

  const title = useMemo(() => {
    switch (type) {
      case 'germinating':
        return strings.CHANGE_GERMINATION_ESTABLISHMENT_STATUS;
      case 'hardening-off':
        return strings.CHANGE_HARDENING_OFF_STATUS;
      case 'active-growth':
        return strings.CHANGE_ACTIVE_GROWTH_STATUS;
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
    } else if (
      type === 'germinating' &&
      (movedValue > +row['germinatingQuantity(raw)'] || record.germinatingQuantity < 0)
    ) {
      setErrorText(strings.GERMINATION_ESTABLISHMENT_QUANTITY_CANNOT_BE_LESS_THAN_ZERO);
      return;
    } else if (
      type === 'active-growth' &&
      (movedValue > +row['activeGrowthQuantity(raw)'] || record.activeGrowthQuantity < 0)
    ) {
      setErrorText(strings.ACTIVE_GROWTH_QUANTITY_CANNOT_BE_LESS_THAN_ZERO);
      return;
    } else if (
      type === 'hardening-off' &&
      (movedValue > +row['hardeningOffQuantity(raw)'] || record.hardeningOffQuantity < 0)
    ) {
      setErrorText(strings.HARDENING_OFF_QUANTITY_CANNOT_BE_LESS_THAN_ZERO);
      return;
    }

    setSaving(true);

    let previousPhase: ChangeBatchStatusesRequestPayload['previousPhase'];

    if (type === 'germinating') {
      previousPhase = 'Germinating';
    } else if (type === 'active-growth') {
      previousPhase = 'ActiveGrowth';
    } else if (type === 'hardening-off') {
      previousPhase = 'HardeningOff';
    }

    const response = await NurseryBatchService.changeBatchStatuses(record, {
      newPhase: nextPhase,
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
  }, [movedValue, nextPhase, onCloseHandler, record, reload, row, snackbar, type]);

  const onSave = useCallback(() => {
    void onSubmit();
  }, [onSubmit]);

  const onChangeMovedValue = useCallback(
    (value: unknown) => {
      const valueNumber = value as number;
      if (value && !isNaN(valueNumber) && valueNumber > 0) {
        setMovedValue(valueNumber);
      } else {
        setMovedValue(undefined);
      }
    },
    [setMovedValue]
  );

  const calculateQuantities = useCallback(() => {
    if (movedValue && !isNaN(movedValue) && movedValue > 0) {
      const valueNumber = movedValue;
      if (type === 'germinating' && nextPhase === 'ActiveGrowth') {
        setRecord({
          ...row,
          germinatingQuantity: +row['germinatingQuantity(raw)'] - valueNumber,
          activeGrowthQuantity: +row['activeGrowthQuantity(raw)'] + +valueNumber,
          hardeningOffQuantity: +row['hardeningOffQuantity(raw)'],
          readyQuantity: +row['readyQuantity(raw)'],
        });
      } else if (type === 'germinating' && nextPhase === 'HardeningOff') {
        setRecord({
          ...row,
          germinatingQuantity: +row['germinatingQuantity(raw)'] - valueNumber,
          activeGrowthQuantity: +row['activeGrowthQuantity(raw)'],
          hardeningOffQuantity: +row['hardeningOffQuantity(raw)'] + +valueNumber,
          readyQuantity: +row['readyQuantity(raw)'],
        });
      } else if (type === 'germinating' && nextPhase === 'Ready') {
        setRecord({
          ...row,
          germinatingQuantity: +row['germinatingQuantity(raw)'] - valueNumber,
          activeGrowthQuantity: +row['activeGrowthQuantity(raw)'],
          hardeningOffQuantity: +row['hardeningOffQuantity(raw)'],
          readyQuantity: +row['readyQuantity(raw)'] + +valueNumber,
        });
      } else if (type === 'active-growth' && nextPhase === 'HardeningOff') {
        setRecord({
          ...row,
          germinatingQuantity: +row['germinatingQuantity(raw)'],
          activeGrowthQuantity: +row['activeGrowthQuantity(raw)'] - valueNumber,
          hardeningOffQuantity: +row['hardeningOffQuantity(raw)'] + +valueNumber,
          readyQuantity: +row['readyQuantity(raw)'],
        });
      } else if (type === 'active-growth' && nextPhase === 'Ready') {
        setRecord({
          ...row,
          germinatingQuantity: +row['germinatingQuantity(raw)'],
          activeGrowthQuantity: +row['activeGrowthQuantity(raw)'] - valueNumber,
          hardeningOffQuantity: +row['hardeningOffQuantity(raw)'],
          readyQuantity: +row['readyQuantity(raw)'] + +valueNumber,
        });
      } else {
        setRecord({
          ...row,
          germinatingQuantity: +row['germinatingQuantity(raw)'],
          activeGrowthQuantity: +row['activeGrowthQuantity(raw)'],
          hardeningOffQuantity: +row['hardeningOffQuantity(raw)'] - valueNumber,
          readyQuantity: +row['readyQuantity(raw)'] + +valueNumber,
        });
      }
    } else {
      setRecord(row);
      setMovedValue(undefined);
    }
  }, [movedValue, nextPhase, row, setRecord, type]);

  const fromLabel = useMemo(() => {
    if (type === 'germinating') {
      return strings.GERMINATION_ESTABLISHMENT;
    } else if (type === 'active-growth') {
      return strings.ACTIVE_GROWTH;
    } else {
      return strings.HARDENING_OFF;
    }
  }, [type]);

  const fromValueFormatted = useMemo(() => {
    if (type === 'germinating') {
      return numberFormatter.format(record.germinatingQuantity);
    } else if (type === 'active-growth') {
      return numberFormatter.format(record.activeGrowthQuantity);
    } else {
      return numberFormatter.format(record.hardeningOffQuantity);
    }
  }, [numberFormatter, record, type]);

  const toLabel = useMemo(() => {
    if (nextPhase === 'ActiveGrowth') {
      return strings.ACTIVE_GROWTH;
    } else if (nextPhase === 'HardeningOff') {
      return strings.HARDENING_OFF;
    } else {
      return strings.READY_TO_PLANT;
    }
  }, [nextPhase]);

  const toValueFormatted = useMemo(() => {
    if (nextPhase === 'ActiveGrowth') {
      return numberFormatter.format(record.activeGrowthQuantity);
    } else if (nextPhase === 'HardeningOff') {
      return numberFormatter.format(record.hardeningOffQuantity);
    } else {
      return numberFormatter.format(record.readyQuantity);
    }
  }, [numberFormatter, record, nextPhase]);

  const growthPhaseDropdownOptions = useMemo(() => {
    return [
      ...(type === 'germinating'
        ? [
            {
              label: strings.ACTIVE_GROWTH,
              value: 'ActiveGrowth',
            },
          ]
        : []),
      ...(type === 'germinating' || type === 'active-growth'
        ? [
            {
              label: strings.HARDENING_OFF,
              value: 'HardeningOff',
            },
          ]
        : []),
      {
        label: strings.READY_TO_PLANT,
        value: 'Ready',
      },
    ];
  }, [type]);

  const onChangeGrowthPhase = useCallback(
    (value: string) => {
      setNextPhase(value as ChangeBatchStatusesRequestPayload['newPhase']);
    },
    [setNextPhase]
  );

  useEffect(() => {
    setNextPhase(growthPhaseDropdownOptions[0].value as ChangeBatchStatusesRequestPayload['newPhase']);
  }, [growthPhaseDropdownOptions, setNextPhase]);

  useEffect(() => {
    calculateQuantities();
  }, [calculateQuantities]);

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

        <Grid display='flex' item marginBottom='16px' textAlign='left' xs={11}>
          <Dropdown
            errorText={undefined}
            fullWidth
            id='nextGrowthPhase'
            label={strings.NEXT_PHASE}
            options={growthPhaseDropdownOptions}
            onChange={onChangeGrowthPhase}
            required
            selectedValue={nextPhase}
          />
        </Grid>

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
