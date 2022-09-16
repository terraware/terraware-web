import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Box, Grid, Link, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { Accession2, updateAccession2 } from 'src/api/accessions2/accession';
import useForm from 'src/utils/useForm';
import { ServerOrganization } from 'src/types/Organization';
import { Unit, WEIGHT_UNITS_V2 } from 'src/components/seeds/nursery/NewTest';
import useSnackbar from 'src/utils/useSnackbar';
import CalculatorModal from './CalculatorModal';
import { Dropdown } from '@terraware/web-components';

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

  useEffect(() => {
    setRecord(accession);
  }, [accession, setRecord]);

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

  const onChangeUnit = (newValue: string) => {
    if (record) {
      setRecord({
        ...record,
        remainingQuantity: {
          quantity: record.remainingQuantity?.quantity || 0,
          units: newValue as Unit['value'],
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
        onPrevious={setOpen}
      />
      <DialogBox
        onClose={onCloseHandler}
        open={open}
        title={strings.QUANTITY}
        size='small'
        middleButtons={[
          <Button label={strings.CANCEL} type='passive' onClick={onCloseHandler} priority='secondary' key='button-1' />,
          <Button onClick={saveQuantity} label={strings.SAVE} key='button-2' />,
        ]}
      >
        <Grid container spacing={2}>
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
          </Grid>
          <Grid item xs={12}>
            <Box display='flex' textAlign='left' alignItems='end'>
              <Textfield
                label={strings.OR_SEED_WEIGHT}
                id='quantity'
                onChange={(id, value) => onChangeRemainingQuantity(id, value as number)}
                type='text'
                value={record.remainingQuantity?.units !== 'Seeds' ? record.remainingQuantity?.quantity : ''}
              />
              <Dropdown
                options={WEIGHT_UNITS_V2}
                placeholder={strings.SELECT}
                onChange={onChangeUnit}
                selectedValue={record.remainingQuantity?.units}
                fullWidth={true}
              />
            </Box>
          </Grid>
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
