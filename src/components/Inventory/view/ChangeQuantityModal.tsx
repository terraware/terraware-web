import React, { useState } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Box, Grid } from '@mui/material';
import { Icon, Textfield } from '@terraware/web-components';
import { ModalValuesType } from './BatchesCellRenderer';
import { Batch } from 'src/types/Batch';
import { NurseryBatchService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';
import useForm from 'src/utils/useForm';

export interface ChangeQuantityModalProps {
  open: boolean;
  onClose: () => void;
  modalValues: ModalValuesType;
  row: Batch;
  reload?: () => void;
}

export default function ChangeQuantityModal(props: ChangeQuantityModalProps): JSX.Element {
  const { onClose, open, modalValues, row, reload } = props;
  const { type } = modalValues;
  const [movedValue, setMovedValue] = useState<number | undefined>();
  const [record, setRecord] = useForm(row);
  const snackbar = useSnackbar();

  const onSubmit = async () => {
    const response = await NurseryBatchService.updateBatchQuantities({ ...record, version: row.version });
    if (response.requestSucceeded) {
      if (reload) {
        reload();
      }
      onCloseHandler();
    } else {
      snackbar.toastError(response.error);
    }
  };

  const onChangeMovedValue = (value: unknown) => {
    if (value && !isNaN(value as number) && (value as number) > 0) {
      const valueNumber = value as number;
      setMovedValue(valueNumber);
      if (type === 'germinating') {
        setRecord({
          ...row,
          germinatingQuantity: +row.germinatingQuantity - valueNumber,
          notReadyQuantity: +row.notReadyQuantity + +valueNumber,
        });
      } else {
        setRecord({
          ...row,
          notReadyQuantity: +row.notReadyQuantity - valueNumber,
          readyQuantity: +row.readyQuantity + +valueNumber,
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
      open={open}
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
        <Grid item xs={11} textAlign='left' display='flex'>
          <Textfield
            value={type === 'germinating' ? record.germinatingQuantity : record.notReadyQuantity}
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
            />
          </Box>
          <Box paddingLeft={1} paddingRight={3} paddingTop={4}>
            <Icon name='iconArrowRight' />
          </Box>
          <Textfield
            value={type === 'germinating' ? record.notReadyQuantity : record.readyQuantity}
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
