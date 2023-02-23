import React, { useState } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Box, Grid, Theme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { Accession } from 'src/types/Accession';
import AccessionService from 'src/services/AccessionService';
import { Unit, usePreferredWeightUnits } from 'src/units';
import useSnackbar from 'src/utils/useSnackbar';
import { Dropdown } from '@terraware/web-components';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  units: {
    marginLeft: theme.spacing(0.5),
  },
}));

export interface CalculatorModalProps {
  open: boolean;
  record: Accession;
  setRecord: React.Dispatch<React.SetStateAction<Accession>>;
  onClose: () => void;
  reload: () => void;
  onChange: (id: string, value: unknown) => void;
  onPrevious: () => void;
}

export default function CalculatorModal(props: CalculatorModalProps): JSX.Element {
  const { onClose, open, record, onChange, setRecord, onPrevious } = props;

  const classes = useStyles();
  const snackbar = useSnackbar();
  const [subsetError, setSubsetError] = useState('');
  const [subsetWeightError, setSubsetWeightError] = useState('');
  const [totalWeightError, setTotalWeightError] = useState('');
  const [subsetCountError, setSubsetCountError] = useState('');
  const preferredUnits = usePreferredWeightUnits();

  const validateFields = () => {
    let hasErrors = false;

    setSubsetError('');
    setSubsetWeightError('');
    if (!record.subsetWeight?.quantity || !record.subsetWeight?.units) {
      setSubsetError(strings.REQUIRED_VALUE_AND_UNITS_FIELD);
      hasErrors = true;
    } else if (record.subsetWeight?.units === record.remainingQuantity?.units) {
      if (+(record.subsetWeight?.quantity || 0) > +(record.remainingQuantity?.quantity || 0)) {
        setSubsetWeightError(strings.SUBSET_WEIGHT_ERROR);
        hasErrors = true;
      }
    }

    setSubsetCountError('');
    if (!record.subsetCount) {
      setSubsetCountError(strings.REQUIRED_FIELD);
      hasErrors = true;
    }

    setTotalWeightError('');
    const totalWeightUnits = record.remainingQuantity?.units ?? 'Seeds';
    if (!record.remainingQuantity?.quantity || totalWeightUnits === 'Seeds') {
      setTotalWeightError(strings.REQUIRED_VALUE_AND_UNITS_FIELD);
      hasErrors = true;
    }

    return !hasErrors;
  };

  const getTotalCount = async () => {
    if (validateFields()) {
      const response = await AccessionService.updateAccession(record, true);
      if (response.requestSucceeded && response.accession) {
        if (
          response.accession.subsetWeight?.grams &&
          response.accession.latestObservedQuantity?.grams &&
          response.accession.subsetWeight?.grams > response.accession.latestObservedQuantity?.grams
        ) {
          setSubsetWeightError(strings.SUBSET_WEIGHT_ERROR);
          return;
        }
        goToPrev();
        setRecord(response.accession);
      } else {
        snackbar.toastError();
      }
    }
  };

  const onCloseHandler = () => {
    setSubsetError('');
    setSubsetWeightError('');
    setSubsetCountError('');
    setTotalWeightError('');

    onClose();
  };

  const goToPrev = () => {
    onPrevious();
    onCloseHandler();
  };

  const onChangeSubsetWeight = (value: any) => {
    setSubsetWeightError('');
    setSubsetError('');
    setRecord({
      ...record,
      subsetWeight: { quantity: value, units: record.subsetWeight?.units || 'Grams' },
    });
  };

  const onChangeSubsetUnit = (newValue: string) => {
    setSubsetWeightError('');
    setSubsetError('');
    setRecord({
      ...record,
      subsetWeight: { quantity: record.subsetWeight?.quantity || 0, units: newValue as Unit['value'] },
    });
  };

  const onChangeRemainingQuantity = (value: number) => {
    setTotalWeightError('');
    setRecord({
      ...record,
      remainingQuantity: { quantity: value, units: record.remainingQuantity?.units || 'Grams' },
    });
  };

  const onChangeRemainingQuantityUnit = (newValue: string) => {
    setTotalWeightError('');
    if (record) {
      setRecord({
        ...record,
        remainingQuantity: { quantity: record.remainingQuantity?.quantity || 0, units: newValue as Unit['value'] },
      });
    }
  };

  const onChangeSubsetCount = (value: number) => {
    setSubsetCountError('');
    onChange('subsetCount', value);
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
          <Button onClick={getTotalCount} label={strings.GET_COUNT} key='button-2' />,
        ]}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} textAlign='left'>
            <Box display='flex' textAlign='left' alignItems='end'>
              <Box width='600px'>
                <Textfield
                  label={strings.SUBSET_WEIGHT}
                  id='subsetWeight'
                  onChange={(value) => onChangeSubsetWeight(value)}
                  type='number'
                  min={0}
                  disabledCharacters={['-']}
                  value={record.subsetWeight?.quantity}
                  errorText={subsetError || subsetWeightError}
                />
              </Box>
              <Box height={subsetWeightError ? '85px' : subsetError ? '65px' : 'auto'}>
                <Dropdown
                  options={preferredUnits}
                  placeholder={strings.SELECT}
                  onChange={onChangeSubsetUnit}
                  selectedValue={record.subsetWeight?.units}
                  fullWidth={true}
                  className={classes.units}
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} textAlign='left'>
            <Textfield
              label={strings.SUBSET_COUNT}
              id='subsetCount'
              onChange={(value) => onChangeSubsetCount(value as number)}
              type='number'
              min={0}
              disabledCharacters={['.', ',', '-']}
              value={record.subsetCount}
              errorText={subsetCountError}
            />
          </Grid>
          <Grid item xs={12} textAlign='left'>
            <Box display='flex' textAlign='left' alignItems='end'>
              <Textfield
                label={strings.TOTAL_WEIGHT}
                id='remainingQuantity'
                onChange={(value) => onChangeRemainingQuantity(value as number)}
                type='number'
                min={0}
                disabledCharacters={['-']}
                value={record.remainingQuantity?.quantity}
                errorText={totalWeightError}
              />
              <Box height={totalWeightError ? '85px' : 'auto'}>
                <Dropdown
                  options={preferredUnits}
                  placeholder={strings.SELECT}
                  onChange={onChangeRemainingQuantityUnit}
                  selectedValue={record.remainingQuantity?.units}
                  fullWidth={true}
                  className={classes.units}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
}
