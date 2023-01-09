import React, { useState } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Box, Grid, Theme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { Accession2, updateAccession2 } from 'src/api/accessions2/accession';
import { Unit, WEIGHT_UNITS_V2 } from 'src/units';
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
  record: Accession2;
  setRecord: React.Dispatch<React.SetStateAction<Accession2>>;
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

  const validateFields = () => {
    if (record.subsetWeight?.units === record.remainingQuantity?.units) {
      if (+(record.subsetWeight?.quantity || 0) > +(record.remainingQuantity?.quantity || 0)) {
        setSubsetError(strings.SUBSET_ERROR);
        return false;
      }
    }
    setSubsetError('');
    return true;
  };

  const getTotalCount = async () => {
    if (validateFields()) {
      const response = await updateAccession2(record, true);
      if (response.requestSucceeded && response.accession) {
        if (
          response.accession.subsetWeight?.grams &&
          response.accession.latestObservedQuantity?.grams &&
          response.accession.subsetWeight?.grams > response.accession.latestObservedQuantity?.grams
        ) {
          setSubsetError(strings.SUBSET_ERROR);
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
              <Box width='600px'>
                <Textfield
                  label={strings.SUBSET_WEIGHT}
                  id='subsetWeight'
                  onChange={(value) => onChangeSubsetWeight(Number(value))}
                  type='text'
                  value={record.subsetWeight?.quantity}
                  errorText={subsetError}
                />
              </Box>
              <Box height={subsetError ? '85px' : 'auto'}>
                <Dropdown
                  options={WEIGHT_UNITS_V2}
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
              onChange={(value) => onChange('subsetCount', value)}
              type='text'
              value={record.subsetCount}
            />
          </Grid>
          <Grid item xs={12} textAlign='left'>
            <Box display='flex' textAlign='left' alignItems='end'>
              <Textfield
                label={strings.TOTAL_WEIGHT}
                id='remainingQuantity'
                onChange={(value) => onChangeRemainingQuantity(Number(value))}
                type='text'
                value={record.remainingQuantity?.quantity}
              />
              <Dropdown
                options={WEIGHT_UNITS_V2}
                placeholder={strings.SELECT}
                onChange={onChangeRemainingQuantityUnit}
                selectedValue={record.remainingQuantity?.units}
                fullWidth={true}
                className={classes.units}
              />
            </Box>
          </Grid>
        </Grid>
      </DialogBox>
    </>
  );
}
