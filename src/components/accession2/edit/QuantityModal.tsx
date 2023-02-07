import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Box, Grid, Theme, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { Accession } from 'src/types/Accession';
import AccessionService from 'src/services/AccessionService';
import useForm from 'src/utils/useForm';
import { isUnitInPreferredSystem, Unit, usePreferredWeightUnits } from 'src/units';
import useSnackbar from 'src/utils/useSnackbar';
import CalculatorModal from './CalculatorModal';
import { Dropdown } from '@terraware/web-components';
import Link from 'src/components/common/Link';
import EditState from './EditState';
import _ from 'lodash';
import { makeStyles } from '@mui/styles';
import isEnabled from 'src/features';
import { useUser } from 'src/providers';
import ConvertedValue from 'src/components/ConvertedValue';

const useStyles = makeStyles((theme: Theme) => ({
  units: {
    marginLeft: theme.spacing(0.5),
  },
}));

export interface QuantityModalProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
  reload: () => void;
  statusEdit?: boolean;
  title: string;
}

export default function QuantityModal(props: QuantityModalProps): JSX.Element {
  const { onClose, open, accession, reload, statusEdit } = props;

  const classes = useStyles();
  const [record, setRecord, onChange] = useForm(accession);
  const [isCalculatorOpened, setIsCalculatorOpened] = useState(false);
  const [quantityError, setQuantityError] = useState(false);
  const theme = useTheme();
  const snackbar = useSnackbar();
  const preferredUnits = usePreferredWeightUnits();
  const weightUnitsEnabled = isEnabled('Weight units');
  const { userPreferences } = useUser();

  const validate = () => {
    const quantity = parseFloat(record.remainingQuantity?.quantity as unknown as string);
    if (isNaN(quantity) || quantity < 0) {
      setQuantityError(true);
      return false;
    }
    return true;
  };

  const saveQuantity = async () => {
    if (!validate()) {
      return;
    }
    const response = await AccessionService.updateAccession(record);
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
    (!_.isEqual(accession.remainingQuantity, record.remainingQuantity) ||
      !_.isEqual(accession.estimatedCount, record.estimatedCount));

  return (
    <>
      <CalculatorModal
        open={isCalculatorOpened}
        onClose={() => setIsCalculatorOpened(false)}
        record={record}
        setRecord={setRecord}
        onChange={onChange}
        reload={reload}
        onPrevious={() => setIsCalculatorOpened(false)}
      />
      <DialogBox
        onClose={onCloseHandler}
        open={open && !isCalculatorOpened}
        title={props.title}
        size='small'
        middleButtons={[
          <Button
            id='cancelQuantity'
            label={strings.CANCEL}
            type='passive'
            onClick={onCloseHandler}
            priority='secondary'
            key='button-1'
          />,
          <Button
            id='saveQuantity'
            onClick={saveQuantity}
            label={strings.SAVE}
            key='button-2'
            disabled={!hasChanged}
          />,
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
              onChange={(value) => onChangeRemainingQuantity('seedsQuantity', Number(value))}
              type='text'
              value={
                record.remainingQuantity?.units === 'Seeds'
                  ? record.remainingQuantity?.quantity.toString()
                  : record.estimatedCount?.toString()
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
                onChange={(value) => onChangeRemainingQuantity('quantity', Number(value))}
                type='text'
                value={record.remainingQuantity?.units !== 'Seeds' ? record.remainingQuantity?.quantity : ''}
              />
              <Dropdown
                options={preferredUnits}
                placeholder={strings.SELECT}
                onChange={onChangeUnit}
                selectedValue={record.remainingQuantity?.units}
                fullWidth={true}
                className={classes.units}
              />
            </Box>
            {weightUnitsEnabled &&
              record.remainingQuantity?.units &&
              record.remainingQuantity?.units !== 'Seeds' &&
              !isUnitInPreferredSystem(
                record.remainingQuantity.units,
                userPreferences.preferredWeightSystem as string
              ) && (
                <ConvertedValue
                  quantity={record.remainingQuantity.quantity}
                  unit={record.remainingQuantity.units}
                  showTooltip={true}
                />
              )}
          </Grid>
          <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
            {!isCalculatorOpened ? (
              <Box display='flex' justifyContent='flex-start'>
                <Link id='addNotes' onClick={openCalculator} fontSize='16px'>
                  {`${strings.WEIGHT_TO_COUNT_CALCULATOR}`}
                </Link>
              </Box>
            ) : null}
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
}
