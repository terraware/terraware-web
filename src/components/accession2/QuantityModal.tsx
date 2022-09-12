import React, { useState } from 'react';
import strings from 'src/strings';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';
import { Box, Grid, Link, useTheme } from '@mui/material';
import { SelectT, Textfield } from '@terraware/web-components';
import { Accession2, updateAccession2 } from 'src/api/accessions2/accession';
import useForm from 'src/utils/useForm';
import { ServerOrganization } from 'src/types/Organization';
import { Unit, WEIGHT_UNITS_V2 } from '../seeds/nursery/NewTest';
import useSnackbar from 'src/utils/useSnackbar';
import CalculatorModal from './CalculatorModal';

export interface QuantityDialogProps {
  open: boolean;
  setOpen: () => void;
  accession: Accession2;
  onClose: () => void;
  reload: () => void;
  organization: ServerOrganization;
}

export default function QuantityDialog(props: QuantityDialogProps): JSX.Element {
  const { onClose, open, accession, reload, organization, setOpen } = props;

  const [record, setRecord, onChange] = useForm(accession);
  const [isCalculatorOpened, setIsCalculatorOpened] = useState(false);
  const theme = useTheme();
  const snackbar = useSnackbar();

  const saveQuantity = async () => {
    const response = await updateAccession2(record);
    if (response.requestSucceeded) {
      reload();
      onCloseHandler();
    } else {
      snackbar.toastError();
      setRecord(accession);
      onCloseHandler();
    }
  };

  const onChangeRemainingQuantity = (id: string, value: number) => {
    if (record) {
      if (id === 'seedsQuantity') {
        setRecord({
          ...record,
          remainingQuantity: {
            quantity: value,
            units: 'Seeds',
          },
        });
      } else {
        setRecord({
          ...record,
          remainingQuantity: {
            quantity: value,
            units: record.remainingQuantity?.units === 'Seeds' ? 'Grams' : record.remainingQuantity?.units || 'Grams',
          },
        });
      }
    }
  };

  const onChangeUnit = (newValue: Unit) => {
    if (record) {
      setRecord({
        ...record,
        remainingQuantity: {
          quantity: record.remainingQuantity?.quantity || 0,
          units: newValue.value,
        },
      });
    }
  };

  const onCloseHandler = () => {
    setRecord(accession);
    onClose();
  };

  const openCalculator = () => {
    setIsCalculatorOpened(true);
    onClose();
  };

  return (
    <>
      <CalculatorModal
        open={isCalculatorOpened}
        onClose={() => setIsCalculatorOpened(false)}
        record={record}
        setRecord={setRecord}
        onChange={onChange}
        organization={organization}
        reload={reload}
        openPreviousModal={setOpen}
      />
      <DialogBox
        onClose={onCloseHandler}
        open={open}
        title={strings.QUANTITY}
        size='medium'
        middleButtons={[
          <Button label={strings.CANCEL} type='passive' onClick={onCloseHandler} priority='secondary' key='button-1' />,
          <Button onClick={saveQuantity} label={strings.SAVE} key='button-2' />,
        ]}
      >
        <Grid item xs={12} textAlign='left'>
          <Textfield
            label={strings.SEED_COUNT}
            id='seedsQuantity'
            onChange={(id, value) => onChangeRemainingQuantity(id, value as number)}
            type='text'
            value={
              record.remainingQuantity?.units === 'Seeds' ? record.remainingQuantity?.quantity : record.estimatedCount
            }
          />
          <Textfield
            label={strings.OR_SEED_WEIGHT}
            id='quantity'
            onChange={(id, value) => onChangeRemainingQuantity(id, value as number)}
            type='text'
            value={record.remainingQuantity?.units !== 'Seeds' ? record.remainingQuantity?.quantity : ''}
          />
          <SelectT<Unit>
            options={WEIGHT_UNITS_V2}
            placeholder={strings.SELECT}
            onChange={onChangeUnit}
            isEqual={(a: Unit, b: Unit) => a.value === b.value}
            renderOption={(unit) => unit.label}
            displayLabel={(unit) => (unit ? unit.label : 'g')}
            selectedValue={WEIGHT_UNITS_V2.find((wu) => wu.value === record.remainingQuantity?.units)}
            toT={(label: string) => ({ label } as Unit)}
            fullWidth={true}
          />
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            {!isCalculatorOpened ? (
              <Box display='flex' justifyContent='flex-start'>
                <Link sx={{ textDecoration: 'none' }} href='#' id='addNotes' onClick={openCalculator}>
                  {`${strings.WEIGHT_TO_COUNT_CALCULATOR} ->`}
                </Link>
              </Box>
            ) : null}
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
}
