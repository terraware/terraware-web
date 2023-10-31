import React, { useMemo, useState } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Box, Grid } from '@mui/material';
import { BusySpinner, Icon, Textfield } from '@terraware/web-components';
import { ModalValuesType } from './BatchesCellRenderer';
import { NurseryBatchService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';
import useForm from 'src/utils/useForm';
import { useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumber';

export interface ChangeQuantityModalProps {
  onClose: () => void;
  modalValues: ModalValuesType;
  row: any;
  reload?: () => void;
}

export default function ChangeQuantityModal(props: ChangeQuantityModalProps): JSX.Element {
  const { onClose, modalValues, row, reload } = props;
  const { type } = modalValues;
  const [saving, setSaving] = useState<boolean>(false);
  const [movedValue, setMovedValue] = useState<number | undefined>();
  const [validate, setValidate] = useState<boolean>(false);
  const [record, setRecord] = useForm({
    ...row,
    germinatingQuantity: +row['germinatingQuantity(raw)'],
    notReadyQuantity: +row['notReadyQuantity(raw)'],
    readyQuantity: +row['readyQuantity(raw)'],
  });
  const snackbar = useSnackbar();
  const { user } = useUser();
  const numberFormatter = useNumberFormatter();
  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [user?.locale, numberFormatter]);

  const onSubmit = async () => {
    setValidate(true);
    if (movedValue === undefined) {
      return;
    }
    setSaving(true);
    const operation = type === 'germinating' ? 'GerminatingToNotReady' : 'NotReadyToReady';
    const response = await NurseryBatchService.changeBatchStatuses(record, { operation, quantity: movedValue });
    setSaving(false);
    if (response.requestSucceeded) {
      if (reload) {
        reload();
      }
      onCloseHandler();
    } else {
      snackbar.toastError();
    }
  };

  const onChangeMovedValue = (value: unknown) => {
    if (value && !isNaN(value as number) && (value as number) > 0) {
      const valueNumber = value as number;
      setMovedValue(valueNumber);
      if (type === 'germinating') {
        setRecord({
          ...row,
          germinatingQuantity: +row['germinatingQuantity(raw)'] - valueNumber,
          notReadyQuantity: +row['notReadyQuantity(raw)'] + +valueNumber,
          readyQuantity: +row['readyQuantity(raw)'],
        });
      } else {
        setRecord({
          ...row,
          germinatingQuantity: +row['germinatingQuantity(raw)'],
          notReadyQuantity: +row['notReadyQuantity(raw)'] - valueNumber,
          readyQuantity: +row['readyQuantity(raw)'] + +valueNumber,
        });
      }
    } else {
      setRecord(row);
      setMovedValue(undefined);
    }
  };

  const onCloseHandler = () => {
    setMovedValue(undefined);
    setRecord(row);
    onClose();
  };

  return (
    <DialogBox
      onClose={onCloseHandler}
      open={true}
      title={type === 'germinating' ? strings.CHANGE_GERMINATING_STATUS : strings.CHANGE_NOT_READY_STATUS}
      size='medium'
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
          type='productive'
          onClick={onSubmit}
          size='medium'
          key='button-2'
        />,
      ]}
    >
      <Grid>
        {saving && <BusySpinner withSkrim={true} />}
        <Grid item xs={11} textAlign='left' display='flex'>
          <Textfield
            value={numericFormatter.format(
              type === 'germinating' ? record.germinatingQuantity : record.notReadyQuantity
            )}
            display={true}
            label={type === 'germinating' ? strings.GERMINATING : strings.NOT_READY}
            id={'previousValue'}
            type={'number'}
          />

          <Box maxWidth='70px' marginLeft={2}>
            <Textfield
              value={movedValue}
              label={strings.MOVE}
              id={'movedValue'}
              type={'number'}
              onChange={(value) => onChangeMovedValue(value)}
              errorText={validate && movedValue === undefined ? strings.REQUIRED_FIELD : ''}
            />
          </Box>
          <Box paddingLeft={1} paddingRight={3} paddingTop={4}>
            <Icon name='iconArrowRight' />
          </Box>
          <Textfield
            value={numericFormatter.format(type === 'germinating' ? record.notReadyQuantity : record.readyQuantity)}
            display={true}
            label={type === 'germinating' ? strings.NOT_READY : strings.READY}
            id={'changedValue'}
            type={'number'}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
