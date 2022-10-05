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
import EditState from './EditState';
import _ from 'lodash';

export interface QuantityModalProps {
  open: boolean;
  accession: Accession2;
  onClose: () => void;
  reload: () => void;
  organization: ServerOrganization;
  statusEdit?: boolean;
}

export default function QuantityModal(props: QuantityModalProps): JSX.Element {
  const { onClose, open, accession, reload, organization, statusEdit } = props;

  const [record, setRecord, onChange] = useForm(accession);
  const [isCalculatorOpened, setIsCalculatorOpened] = useState(false);
  const [quantityError, setQuantityError] = useState(false);
  const theme = useTheme();
  const snackbar = useSnackbar();

  const validate = () => {
    const quantity = parseFloat(record.remainingQuantity?.quantity as unknown as string);
    if (isNaN(quantity) || quantity <= 0) {
      setQuantityError(true);
      return false;
    }
    return true;
  };

  const saveQuantity = async () => {
    if (!validate()) {
      return;
    }
    const response = await updateAccession2(record);
    if (response.requestSucceeded) {
      reload();
      onCloseHandler();
    } else {
      snackbar.toastError(response.error);
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
      setQuantityError(false);
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

  const onChangeStatus = (id: string, value: unknown) => {
    onChange(id, value);
  };

  const onCloseHandler = () => {
    setRecord(accession);
    onClose();
  };

  const openCalculator = () => {
    setIsCalculatorOpened(true);
  };

  const hasChanged =
    (!statusEdit || accession.state !== record.state) &&
    !_.isEqual(accession.remainingQuantity, record.remainingQuantity);

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
        onPrevious={() => setIsCalculatorOpened(false)}
      />
      <DialogBox
        onClose={onCloseHandler}
        open={open && !isCalculatorOpened}
        title={statusEdit ? strings.STATUS : strings.QUANTITY}
        size='small'
        middleButtons={[
          <Button label={strings.CANCEL} type='passive' onClick={onCloseHandler} priority='secondary' key='button-1' />,
          <Button onClick={saveQuantity} label={strings.SAVE} key='button-2' disabled={!hasChanged} />,
        ]}
      >
        {statusEdit === true && (
          <Box sx={{ marginBottom: 2 }}>
            <EditState accession={accession} record={record} onChange={onChangeStatus} />
          </Box>
        )}
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
              errorText={
                quantityError
                  ? record.remainingQuantity?.quantity
                    ? strings.INVALID_VALUE
                    : strings.REQUIRED_FIELD
                  : ''
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
