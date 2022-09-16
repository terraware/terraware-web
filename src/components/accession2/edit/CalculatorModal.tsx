import React from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Box, Grid } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { Accession2, updateAccession2 } from 'src/api/accessions2/accession';
import { ServerOrganization } from 'src/types/Organization';
import { Unit, WEIGHT_UNITS_V2 } from 'src/components/seeds/nursery/NewTest';
import useSnackbar from 'src/utils/useSnackbar';
import { Dropdown } from '@terraware/web-components';

export interface CalculatorDialogProps {
  open: boolean;
  record: Accession2;
  setRecord: React.Dispatch<React.SetStateAction<Accession2>>;
  onClose: () => void;
  reload: () => void;
  organization: ServerOrganization;
  onChange: (id: string, value: unknown) => void;
  onPrevious: () => void;
}

export default function CalculatorDialog(props: CalculatorDialogProps): JSX.Element {
  const { onClose, open, record, onChange, setRecord, onPrevious } = props;

  const snackbar = useSnackbar();

  const getTotalCount = async () => {
    const response = await updateAccession2(record, true);
    if (response.requestSucceeded && response.accession) {
      goToPrev();
      setRecord(response.accession);
    } else {
      snackbar.toastError();
    }
  };

  const onCloseHandler = () => {
    onClose();
  };

  const goToPrev = () => {
    onPrevious();
    onCloseHandler();
  };

  const onChangeSubsetWeight = (value: number) => {
    setRecord({
      ...record,
      subsetWeight: { quantity: value, units: record.subsetWeight?.units || 'Grams' },
    });
  };

  const onChangeSubsetUnit = (newValue: string) => {
    setRecord({
      ...record,
      subsetWeight: { quantity: record.subsetWeight?.quantity || 0, units: newValue as Unit['value'] },
    });
  };

  const onChangeRemainingQuantity = (value: number) => {
    setRecord({
      ...record,
      remainingQuantity: { quantity: value, units: record.remainingQuantity?.units || 'Grams' },
    });
  };

  const onChangeRemainingQuantityUnit = (newValue: string) => {
    if (record) {
      setRecord({
        ...record,
        remainingQuantity: { quantity: record.remainingQuantity?.quantity || 0, units: newValue as Unit['value'] },
      });
    }
  };

  return (
    <>
      <DialogBox
        onClose={onCloseHandler}
        open={open}
        title={strings.QUANTITY}
        size='small'
        middleButtons={[
          <Button label={strings.BACK} type='passive' onClick={goToPrev} priority='secondary' key='button-1' />,
          <Button onClick={getTotalCount} label={strings.GET_TOTAL_COUNT} key='button-2' />,
        ]}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} textAlign='left'>
            <Box display='flex' textAlign='left' alignItems='end'>
              <Textfield
                label={strings.SUBSET_WEIGHT}
                id='subsetWeight'
                onChange={(id, value) => onChangeSubsetWeight(value as number)}
                type='text'
                value={record.subsetWeight?.quantity}
              />
              <Dropdown
                options={WEIGHT_UNITS_V2}
                placeholder={strings.SELECT}
                onChange={onChangeSubsetUnit}
                selectedValue={record.subsetWeight?.units}
                fullWidth={true}
              />
            </Box>
          </Grid>
          <Grid item xs={12} textAlign='left'>
            <Textfield
              label={strings.SUBSET_COUNT}
              id='subsetCount'
              onChange={onChange}
              type='text'
              value={record.subsetCount}
            />
          </Grid>
          <Grid item xs={12} textAlign='left'>
            <Box display='flex' textAlign='left' alignItems='end'>
              <Textfield
                label={strings.TOTAL_WEIGHT}
                id='remainingQuantity'
                onChange={(id, value) => onChangeRemainingQuantity(value as number)}
                type='text'
                value={record.remainingQuantity?.quantity}
              />
              <Dropdown
                options={WEIGHT_UNITS_V2}
                placeholder={strings.SELECT}
                onChange={onChangeRemainingQuantityUnit}
                selectedValue={record.remainingQuantity?.units}
                fullWidth={true}
              />
            </Box>
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
}
