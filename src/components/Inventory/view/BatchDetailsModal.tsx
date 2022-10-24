import { Divider, Grid, useTheme } from '@mui/material';
import { Button, DatePicker, DialogBox, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import { ServerOrganization } from 'src/types/Organization';
import { useEffect, useState } from 'react';
import useSnackbar from 'src/utils/useSnackbar';
import { getTodaysDateFormatted, useDeviceInfo } from '@terraware/web-components/utils';
import NurseryDropdown from '../NurseryDropdown';
import { Batch, CreateBatchRequestPayload } from 'src/api/types/batch';
import { createBatch, updateBatch } from 'src/api/batch/batch';

export interface BatchDetailsModalProps {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  organization: ServerOrganization;
  selectedBatch: Batch | undefined;
  speciesId: number;
}

export default function BatchDetailsModal(props: BatchDetailsModalProps): JSX.Element {
  const { onClose, open, organization, reload, selectedBatch, speciesId } = props;

  const [record, setRecord, onChange] = useForm(selectedBatch);
  const snackbar = useSnackbar();
  const theme = useTheme();
  const [validateFields, setValidateFields] = useState<boolean>(false);

  const { isMobile } = useDeviceInfo();
  const [totalQuantity, setTotalQuantity] = useState(0);

  useEffect(() => {
    if (record) {
      setTotalQuantity(
        (isNaN(record.notReadyQuantity) ? 0 : Number(record.notReadyQuantity)) +
          (isNaN(record.readyQuantity) ? 0 : Number(record.readyQuantity))
      );
    }
  }, [record]);

  useEffect(() => {
    const newBatch: CreateBatchRequestPayload = {
      addedDate: getTodaysDateFormatted(),
      facilityId: undefined,
      speciesId,
      germinatingQuantity: undefined,
      notReadyQuantity: undefined,
      readyQuantity: undefined,
    } as unknown as CreateBatchRequestPayload;
    const initBatch = () => {
      if (selectedBatch) {
        return selectedBatch;
      } else {
        return {
          ...newBatch,
          id: -1,
          batchNumber: '',
          latestObservedTime: '',
          version: 0,
        };
      }
    };

    setRecord(initBatch());
  }, [selectedBatch, speciesId, setRecord]);

  const MANDATORY_FIELDS = [
    'facilityId',
    'germinatingQuantity',
    'notReadyQuantity',
    'readyQuantity',
    'addedDate',
  ] as const;
  type MandatoryField = typeof MANDATORY_FIELDS[number];

  const hasErrors = () => {
    if (record) {
      const missingRequiredField = MANDATORY_FIELDS.some((field: MandatoryField) => !record[field]);
      return missingRequiredField;
    }
    return true;
  };

  const saveBatch = async () => {
    if (record) {
      if (hasErrors()) {
        setValidateFields(true);
        return;
      }

      let response;
      if (record.id === -1) {
        response = await createBatch(record);
      } else {
        response = await updateBatch(record);
      }
      if (response.requestSucceeded) {
        reload();
        onCloseHandler();
      } else {
        snackbar.toastError(response.error);
      }
    }
  };

  const onCloseHandler = () => {
    setValidateFields(false);
    onClose();
  };

  const gridSize = () => (isMobile ? 12 : 6);

  const paddingSeparator = () => (isMobile ? 0 : 1.5);

  const changeDate = (id: string, value?: any) => {
    onChange(id, value);
  };

  const marginTop = {
    marginTop: theme.spacing(2),
  };

  return (
    <>
      {record && (
        <DialogBox
          onClose={onCloseHandler}
          open={open}
          title={record.id === -1 ? strings.ADD_SEEDLING_BATCH : strings.SEEDLING_BATCH_DETAILS}
          size='large'
          middleButtons={[
            <Button
              label={strings.CANCEL}
              type='passive'
              onClick={onCloseHandler}
              priority='secondary'
              key='button-1'
            />,
            <Button onClick={saveBatch} label={record.id === -1 ? strings.ADD_BATCH : strings.SAVE} key='button-2' />,
          ]}
          scrolled={true}
        >
          <Grid container item xs={12} spacing={2} textAlign='left'>
            <Grid xs={12} padding={theme.spacing(1, 0, 1, 2)}>
              <NurseryDropdown
                label={strings.NURSERY_REQUIRED}
                record={record}
                setRecord={setRecord as unknown as React.Dispatch<React.SetStateAction<Batch>>}
                organization={organization}
                validate={validateFields}
              />
            </Grid>
            <Grid item xs={12} sx={marginTop}>
              <Divider />
            </Grid>
            <Grid
              item
              xs={gridSize()}
              paddingRight={paddingSeparator}
              sx={{ ...marginTop, marginRight: isMobile ? 0 : theme.spacing(2) }}
            >
              <Textfield
                id='germinatingQuantity'
                value={record.germinatingQuantity}
                onChange={onChange}
                type='text'
                label={strings.GERMINATING_QUANTITY_REQUIRED}
                tooltipTitle={strings.TOOLTIP_GERMINATING_QUANTITY}
                errorText={validateFields && !record.germinatingQuantity ? strings.REQUIRED_FIELD : ''}
              />
            </Grid>
            <Grid item xs={12} sx={marginTop}>
              <Divider />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='notReadyQuantity'
                value={record.notReadyQuantity}
                onChange={onChange}
                type='text'
                label={strings.NOT_READY_QUANTITY_REQUIRED}
                tooltipTitle={strings.TOOLTIP_NOT_READY_QUANTITY}
                errorText={validateFields && !record.notReadyQuantity ? strings.REQUIRED_FIELD : ''}
              />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
              <DatePicker
                id='readyByDate'
                label={strings.ESTIMATED_READY_DATE}
                aria-label={strings.ESTIMATED_READY_DATE}
                value={record.readyByDate}
                onChange={changeDate}
              />
            </Grid>
            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='readyQuantity'
                value={record.readyQuantity}
                onChange={onChange}
                type='text'
                label={strings.READY_QUANTITY_REQUIRED}
                tooltipTitle={strings.TOOLTIP_READY_QUANTITY}
                errorText={validateFields && !record.readyQuantity ? strings.REQUIRED_FIELD : ''}
              />
            </Grid>

            <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator} />
            <Grid item xs={gridSize()} sx={marginTop} paddingRight={paddingSeparator}>
              <Textfield
                id='totalQuantity'
                value={totalQuantity}
                onChange={onChange}
                type='text'
                label={strings.TOTAL_QUANTITY}
                display={true}
              />
            </Grid>

            <Grid item xs={gridSize()} sx={marginTop} paddingLeft={paddingSeparator}>
              <DatePicker
                id='dateAdded'
                label={strings.DATE_ADDED_REQUIRED}
                aria-label={strings.DATE_ADDED}
                value={record.addedDate}
                onChange={changeDate}
              />
            </Grid>
            <Grid padding={theme.spacing(3, 0, 1, 2)} xs={12}>
              <Textfield id='notes' value={record?.notes} onChange={onChange} type='textarea' label={strings.NOTES} />
            </Grid>
          </Grid>
        </DialogBox>
      )}
    </>
  );
}
